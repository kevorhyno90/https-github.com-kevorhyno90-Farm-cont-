import { InventoryItem, InventoryMovementLog, InventorySectionTarget } from '../types';
import { toIsoDate } from './dateHelper';

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
    localStorage.setItem('jr_farm_inventory_movements', JSON.stringify(logs.slice(0, 500)));
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
  } else if (qtyAfter <= item.minStock) {
    alertType = 'low_stock';
    alertMessage = `⚠️ LOW STOCK ALERT: "${item.name}" balance is down to ${qtyAfter} ${item.unit} (Safety min: ${item.minStock}). Reorder soon.`;
  }

  return {
    updatedItem,
    movementLog,
    alertType,
    alertMessage
  };
}
