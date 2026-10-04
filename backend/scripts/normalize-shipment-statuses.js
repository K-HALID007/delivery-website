import 'dotenv/config';
import connectDB from '../config/db.js';
import Tracking from '../models/tracking.model.js';
import { normalizeShipmentStatus } from '../utils/shipmentLifecycle.js';

try {
  await connectDB();
  let updated = 0;
  const cursor = Tracking.find().cursor();
  for await (const tracking of cursor) {
    let changed = false;
    const canonical = normalizeShipmentStatus(tracking.status);
    if (canonical && canonical !== tracking.status) {
      tracking.status = canonical;
      changed = true;
    }
    for (const field of ['history', 'statusHistory']) {
      for (const event of tracking[field] || []) {
        const eventStatus = normalizeShipmentStatus(event.status);
        if (eventStatus && eventStatus !== event.status) {
          event.status = eventStatus;
          changed = true;
        }
      }
    }
    if (changed) {
      await tracking.save();
      updated += 1;
    }
  }
  console.log(`Normalized shipment statuses for ${updated} records.`);
  process.exitCode = 0;
} catch (error) {
  console.error('Shipment status migration failed:', error);
  process.exitCode = 1;
} finally {
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
}
