import { InventoryItem, InventoryMovementLog, InventorySectionTarget, FinancialRecord } from '../types';
import { toIsoDate } from './dateHelper';
import { setPersistentData, getPersistentData } from './storageDb';

export function getItemStockStatus(item: InventoryItem): 'Out of Stock (Over)' | 'Low Stock Warning' | 'Expired' | 'In Stock' {
  const today = toIsoDate(new Date());
  if (item.expiryDate && item.expiryDate < today) {
    return 'Expired';
  }
  if (item.quantity <= 0) {
    return 'Out of Stock (Over)';
  }
  if (item.quantity <= item.minStock) {
    return 'Low Stock Warning';
  }
  return 'In Stock';
}

export function logInventoryMovement(
  movement: Omit<InventoryMovementLog, 'id' | 'date'>
): InventoryMovementLog {
  const newLog: InventoryMovementLog = {
    ...movement,
    id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: toIsoDate(new Date())
  };

  try {
    const existingStr = localStorage.getItem('jr_farm_inventory_movements');
    const logs: InventoryMovementLog[] = existingStr ? JSON.parse(existingStr) : [];
    logs.unshift(newLog);
    setPersistentData('jr_farm_inventory_movements', logs.slice(0, 500));
  } catch (err) {
    console.error('Failed to persist movement log:', err);
  }

  return newLog;
}

export interface DispenseResult {
  updatedItem: InventoryItem;
  movementLog: InventoryMovementLog;
  alertType: 'depleted' | 'low_stock' | 'normal';
  alertMessage?: string;
}

export function dispenseItemStock(
  item: InventoryItem,
  amount: number,
  section: InventorySectionTarget,
  reason: string,
  staffName: string
): DispenseResult {
  const qtyBefore = item.quantity;
  const qtyAfter = Math.max(0, Number((qtyBefore - amount).toFixed(2)));

  const updatedItem: InventoryItem = {
    ...item,
    quantity: qtyAfter,
    lastUsedDate: toIsoDate(new Date())
  };

  const movementLog = logInventoryMovement({
    itemId: item.id,
    itemName: item.name,
    category: item.category,
    movementType: 'Consumption / Usage',
    quantityChanged: -amount,
    quantityBefore: qtyBefore,
    quantityAfter: qtyAfter,
    unit: item.unit,
    usedBySection: section,
    purposeOrReason: reason,
    loggedBy: staffName
  });

  let alertType: 'depleted' | 'low_stock' | 'normal' = 'normal';
  let alertMessage: string | undefined;

  if (qtyAfter <= 0) {
    alertType = 'depleted';
    alertMessage = `🚨 OVER / OUT OF STOCK: "${item.name}" is completely finished (0 ${item.unit})! Urgent reorder needed for ${section}.`;
    triggerNativeNotification('Stock Depleted Alarm', alertMessage);
  } else if (qtyAfter <= item.minStock) {
    alertType = 'low_stock';
    alertMessage = `⚠️ LOW STOCK ALERT: "${item.name}" balance is down to ${qtyAfter} ${item.unit} (Safety min: ${item.minStock}). Reorder soon.`;
    triggerNativeNotification('Low Stock Warning', alertMessage);
  }

  // Dispatch global event for other components to reactively update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('farm-inventory-updated', { detail: { item: updatedItem, movement: movementLog } }));
  }

  return {
    updatedItem,
    movementLog,
    alertType,
    alertMessage
  };
}

/**
 * Universal auto-deduction helper callable from ANY section (Veterinary, Spray, Poultry, TMR)
 * Matches item by name or partial name and auto-deducts the required amount.
 */
export function autoDeductInventoryItem(
  drugOrItemName: string,
  amount: number = 1,
  section: InventorySectionTarget = 'General Farm Operations',
  reason: string = 'Cross-section consumption',
  staffName: string = 'Farm Officer'
): { success: boolean; message: string; remaining?: number } {
  try {
    const stored = localStorage.getItem('jr_farm_inventory');
    if (!stored) return { success: false, message: 'No inventory data found.' };

    const items: InventoryItem[] = JSON.parse(stored);
    const query = drugOrItemName.toLowerCase().trim();

    // Find best matching item
    const matched = items.find(i => {
      const nameLower = i.name.toLowerCase();
      return nameLower.includes(query) || query.includes(nameLower) ||
        (query.includes('penicillin') && nameLower.includes('penstrep')) ||
        (query.includes('oxytetracycline') && nameLower.includes('alamycin')) ||
        (query.includes('coccidi') && nameLower.includes('amprolium')) ||
        (query.includes('deworm') && (nameLower.includes('albendazole') || nameLower.includes('piperazine'))) ||
        (query.includes('newcastle') && nameLower.includes('lasota')) ||
        (query.includes('copper') && nameLower.includes('copper oxychloride')) ||
        (query.includes('ridomil') && nameLower.includes('ridomil'));
    });

    if (!matched) {
      return { success: false, message: `No matching stock item found for "${drugOrItemName}".` };
    }

    const res = dispenseItemStock(matched, amount, section, reason, staffName);

    // Save updated items back to localStorage & IDB
    const updatedItems = items.map(i => i.id === matched.id ? res.updatedItem : i);
    setPersistentData('jr_farm_inventory', updatedItems);

    return {
      success: true,
      message: res.alertMessage || `Deducted ${amount} ${matched.unit} of "${matched.name}". New balance: ${res.updatedItem.quantity} ${matched.unit}.`,
      remaining: res.updatedItem.quantity
    };
  } catch (err: any) {
    console.error('Auto-deduction error:', err);
    return { success: false, message: err?.message || 'Auto-deduction failed.' };
  }
}

/**
 * Universal financial auto-posting helper callable from ANY section (Egg sales, Cull meat sales, Tea delivery, Restock expense)
 */
export function autoPostFinancialTransaction(tx: {
  type: 'income' | 'expense' | 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  date?: string;
}): boolean {
  try {
    const date = tx.date || toIsoDate(new Date());
    const stored = localStorage.getItem('jr_farm_financials');
    const records: FinancialRecord[] = stored ? JSON.parse(stored) : [];

    const normalizedType: 'income' | 'expense' = tx.type.toLowerCase() === 'income' ? 'income' : 'expense';

    const newRecord: FinancialRecord = {
      id: `fin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: normalizedType,
      category: tx.category,
      amount: Math.round(tx.amount),
      description: tx.description,
      date
    };

    records.unshift(newRecord);
    setPersistentData('jr_farm_financials', records);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('farm-financials-updated', { detail: newRecord }));
    }

    return true;
  } catch (err) {
    console.error('Auto-posting to financial ledger failed:', err);
    return false;
  }
}

/**
 * Trigger native browser / smartphone push notification if allowed
 */
export function triggerNativeNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`JR Farm: ${title}`, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      });
    } catch {}
  }
}
