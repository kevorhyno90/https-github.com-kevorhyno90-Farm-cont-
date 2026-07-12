export const toIsoDate = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

export const offsetIsoDate = (days: number, from: Date = new Date()): string => {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

export const offsetIsoYears = (years: number, from: Date = new Date()): string => {
  const date = new Date(from);
  date.setFullYear(date.getFullYear() + years);
  return toIsoDate(date);
};

export const toTimestamp = (date: Date = new Date()): string => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${toIsoDate(date)} ${hh}:${mm}`;
};
