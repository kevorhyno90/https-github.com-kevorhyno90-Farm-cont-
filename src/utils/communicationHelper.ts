import { StaffMember } from '../types';
import { getStoredSettings } from './settingsHelper';

/**
 * Format any phone number into standard international format (defaults to Kenya 254 if local)
 */
export function formatToInternationalPhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9+]/g, '');
  
  // Handle leading +
  if (clean.startsWith('+')) {
    clean = clean.substring(1);
  }

  // Handle Kenya local format 07... or 01...
  if (clean.startsWith('0') && clean.length === 10) {
    clean = '254' + clean.slice(1);
  }

  return clean;
}

/**
 * Launch device dialer directly
 */
export function openCall(phone: string) {
  if (!phone) return;
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  window.location.href = `tel:${cleanPhone}`;
}

/**
 * Open native SMS app with optional pre-filled message (safe for Android, iOS & Desktop)
 */
export function openSms(phone: string, message: string = '') {
  if (!phone) return;
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encoded = encodeURIComponent(message);
  
  // Detect iOS Safari for correct URL separator
  const isIOS = typeof navigator !== 'undefined' && 
    /iPad|iPhone|iPod/.test(navigator.userAgent) && 
    !(window as any).MSStream;
  
  const separator = isIOS ? '&' : '?';
  const url = `sms:${cleanPhone}${message ? `${separator}body=${encoded}` : ''}`;
  window.location.href = url;
}

/**
 * Open WhatsApp chat with pre-filled message
 */
export function openWhatsApp(phone: string, message: string = '') {
  if (!phone) return;
  const intlPhone = formatToInternationalPhone(phone);
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${intlPhone}${message ? `?text=${encoded}` : ''}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Generate formatted Morning Chore & Duty Dispatch message
 */
export function generateMorningChoreDispatchMessage(
  staff: StaffMember,
  options?: {
    customChores?: string[];
    date?: string;
  }
): string {
  const settings = getStoredSettings();
  const farmName = settings.estateName || 'JR Farm';
  const dateStr = options?.date || new Date().toISOString().split('T')[0];

  let msg = `🌅 *${farmName.toUpperCase()} - DAILY CHORE DISPATCH*\n`;
  msg += `📅 *Date:* ${dateStr}\n`;
  msg += `👤 *Staff:* ${staff.name} (${staff.role})\n`;
  msg += `📍 *Unit/Station:* ${staff.unit} ${staff.assignedStation ? `| Station: ${staff.assignedStation}` : ''}\n\n`;

  msg += `⏰ *Shift Schedule:*\n`;
  msg += `• Morning Shift: ${staff.shiftMorning || 'Standard Duties'}\n`;
  msg += `• Afternoon Shift: ${staff.shiftAfternoon || 'Standard Duties'}\n\n`;

  if (options?.customChores && options.customChores.length > 0) {
    msg += `📋 *Today's Key Priorities:*\n`;
    options.customChores.forEach((chore, idx) => {
      msg += `${idx + 1}. ${chore}\n`;
    });
    msg += `\n`;
  }

  msg += `⚠️ *Notice:* Inspect safety gear (PPE) and verify biosecurity footbaths before entering pens/blocks.\n`;
  msg += `_Please acknowledge receipt and confirm your attendance._`;

  return msg;
}

/**
 * Generate formatted Emergency Veterinary alert
 */
export function generateEmergencyVetMessage(params: {
  cowTag?: string;
  symptoms?: string;
  urgency?: 'Critical' | 'High' | 'Routine';
  location?: string;
}): string {
  const settings = getStoredSettings();
  const farmName = settings.estateName || 'JR Farm';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let msg = `🚨 *URGENT VET ALERT - ${farmName.toUpperCase()}*\n`;
  msg += `⏰ *Time:* ${timeNow}\n`;
  msg += `⚠️ *Urgency:* ${params.urgency || 'Critical'}\n`;
  if (params.cowTag) msg += `🐄 *Target Animal Tag:* ${params.cowTag}\n`;
  msg += `🩺 *Observed Symptoms / Condition:* ${params.symptoms || 'Acute clinical distress requiring examination.'}\n`;
  msg += `📍 *Compound Location:* ${params.location || 'Dairy Unit / Main Treatment Crush'}\n\n`;
  msg += `_Please call the farm manager immediately or confirm arrival time._`;

  return msg;
}

/**
 * Generate Security / Perimeter alert
 */
export function generateSecurityAlertMessage(params: {
  incident?: string;
  location?: string;
}): string {
  const settings = getStoredSettings();
  const farmName = settings.estateName || 'JR Farm';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let msg = `🚨 *SECURITY & FENCE ALERT - ${farmName.toUpperCase()}*\n`;
  msg += `⏰ *Time:* ${timeNow}\n`;
  msg += `🛡️ *Incident:* ${params.incident || 'Perimeter alarm triggered / suspicious activity observed.'}\n`;
  msg += `📍 *Location:* ${params.location || 'Main Gate / Compound Perimeter'}\n\n`;
  msg += `_All on-duty security and herdsmen proceed to location with caution._`;

  return msg;
}

/**
 * Generate M-Pesa / Wage payment notification
 */
export function generatePaymentSentMessage(params: {
  staffName: string;
  amount: number;
  period?: string;
  ref?: string;
}): string {
  const settings = getStoredSettings();
  const farmName = settings.estateName || 'JR Farm';

  let msg = `💰 *PAYMENT NOTIFICATION - ${farmName.toUpperCase()}*\n`;
  msg += `Hello ${params.staffName},\n`;
  msg += `Your wage payment of *KES ${params.amount.toLocaleString()}* for ${params.period || 'the current period'} has been processed.\n`;
  if (params.ref) msg += `Reference / Transaction ID: ${params.ref}\n`;
  msg += `Thank you for your dedicated service to ${farmName}.`;

  return msg;
}
