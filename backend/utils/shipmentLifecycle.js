const STATUS_ALIASES = new Map([
  ['pending', 'pending'],
  ['processing', 'pending'],
  ['assigned', 'assigned'],
  ['reassigned', 'assigned'],
  ['picked up', 'picked_up'],
  ['picked_up', 'picked_up'],
  ['in transit', 'in_transit'],
  ['in_transit', 'in_transit'],
  ['out for delivery', 'out_for_delivery'],
  ['out_for_delivery', 'out_for_delivery'],
  ['delivered', 'delivered'],
  ['cancelled', 'cancelled'],
  ['canceled', 'cancelled'],
  ['failed', 'failed']
]);

export const SHIPMENT_STATUSES = Object.freeze([
  'pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'failed'
]);

export const PARTNER_STATUS_TRANSITIONS = Object.freeze({
  assigned: ['picked_up'],
  picked_up: ['in_transit'],
  in_transit: ['out_for_delivery'],
  out_for_delivery: ['delivered']
});

export function normalizeShipmentStatus(value) {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
  return STATUS_ALIASES.get(key) || null;
}

export function getLegacyStatusValues(canonicalStatus) {
  const values = new Set([canonicalStatus]);
  if (typeof canonicalStatus === 'string') {
    values.add(canonicalStatus.replace(/\b\w/g, char => char.toUpperCase()).replace(/_/g, ' '));
  }
  for (const [legacy, canonical] of STATUS_ALIASES) {
    if (canonical !== canonicalStatus) continue;
    values.add(legacy);
    if (legacy.includes(' ')) values.add(legacy.replace(/\b\w/g, char => char.toUpperCase()));
    if (legacy.includes('_')) values.add(legacy.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()));
  }
  return [...values];
}

export function canPartnerTransition(currentStatus, nextStatus) {
  const current = normalizeShipmentStatus(currentStatus);
  const next = normalizeShipmentStatus(nextStatus);
  return Boolean(current && next && PARTNER_STATUS_TRANSITIONS[current]?.includes(next));
}
