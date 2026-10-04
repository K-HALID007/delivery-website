import test from 'node:test';
import assert from 'node:assert/strict';
import { canPartnerTransition, getLegacyStatusValues, normalizeShipmentStatus } from '../utils/shipmentLifecycle.js';
import { consumeRateLimit } from '../utils/rateLimit.js';
import { generateTrackingId } from '../utils/trackingId.js';

test('shipment statuses normalize case and legacy display values', () => {
  assert.equal(normalizeShipmentStatus('In Transit'), 'in_transit');
  assert.equal(normalizeShipmentStatus('PICKED_UP'), 'picked_up');
  assert.equal(normalizeShipmentStatus('not a status'), null);
  assert.ok(getLegacyStatusValues('delivered').includes('Delivered'));
});

test('partners can only move deliveries through the next workflow step', () => {
  assert.equal(canPartnerTransition('Assigned', 'picked_up'), true);
  assert.equal(canPartnerTransition('picked_up', 'delivered'), false);
  assert.equal(canPartnerTransition('delivered', 'assigned'), false);
});

test('rate limits reset after their window and reject excess requests', () => {
  const store = new Map();
  const options = { limit: 2, windowMs: 1000, store };
  assert.equal(consumeRateLimit('client', { ...options, now: 100 }).allowed, true);
  assert.equal(consumeRateLimit('client', { ...options, now: 200 }).allowed, true);
  assert.equal(consumeRateLimit('client', { ...options, now: 300 }).allowed, false);
  assert.equal(consumeRateLimit('client', { ...options, now: 1100 }).allowed, true);
});

test('tracking IDs use a month prefix and high entropy', () => {
  const date = new Date(2026, 9, 4);
  const first = generateTrackingId(date);
  const second = generateTrackingId(date);
  assert.match(first, /^TRK2610[A-F0-9]{24}$/);
  assert.notEqual(first, second);
});
