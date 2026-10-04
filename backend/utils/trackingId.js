import { randomBytes } from 'node:crypto';

export function generateTrackingId(date = new Date()) {
  const yearMonth = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `TRK${yearMonth}${randomBytes(12).toString('hex').toUpperCase()}`;
}
