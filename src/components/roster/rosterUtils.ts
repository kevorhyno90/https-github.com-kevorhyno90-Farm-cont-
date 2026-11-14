import { StaffMember, StaffOffRecord } from '../../types';

/**
 * Calculate inclusive calendar days between two ISO date strings.
 */
export function calculateLeaveDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  const d1 = new Date(startDate).getTime();
  const d2 = new Date(endDate).getTime();
  if (isNaN(d1) || isNaN(d2)) return 1;
  const diffTime = d2 - d1;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

/**
 * Compute annual leave entitlement, days taken in the current calendar year, and remaining balance.
 */
export function computeStaffAnnualLeaveStats(
  staffId: string,
  staffList: StaffMember[],
  staffOffRecords: StaffOffRecord[]
) {
  const member = staffList.find((s) => s.id === staffId);
  const entitlement = member?.annualLeaveEntitlement !== undefined ? member.annualLeaveEntitlement : 21;
  const currentYear = new Date().getFullYear().toString();

  const annualLeaveRecords = staffOffRecords.filter((r) => {
    return (
      r.staffId === staffId &&
      r.type === 'Annual Leave' &&
      (r.status === 'Approved' || r.status === 'Completed') &&
      (r.startDate.startsWith(currentYear) || r.endDate.startsWith(currentYear))
    );
  });

  const daysTaken = annualLeaveRecords.reduce((total, r) => {
    return total + calculateLeaveDays(r.startDate, r.endDate);
  }, 0);

  const remaining = Math.max(0, entitlement - daysTaken);
  const percentageUsed = entitlement > 0 ? Math.min(100, Math.round((daysTaken / entitlement) * 100)) : 0;

  return {
    entitlement,
    daysTaken,
    remaining,
    percentageUsed,
    recordsCount: annualLeaveRecords.length
  };
}

/**
 * Extract up to 2 uppercase initials from a staff member's name.
 */
export function getInitials(name?: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Format an amount in Kenyan Shillings (KES).
 */
export function formatKsh(amount?: number): string {
  return `KES ${(amount || 0).toLocaleString()}`;
}

