const baseRates = {
  standard: 49,
  express: 99,
  fragile: 79,
  oversized: 149
};

export const calculateShippingCost = (packageDetails = {}) => {
  const type = String(packageDetails.type || '').toLowerCase();
  const weight = Number(packageDetails.weight);
  if (!Object.hasOwn(baseRates, type) || !Number.isFinite(weight) || weight <= 0 || weight > 1000) {
    throw new Error('Choose a valid package type and a weight between 0 and 1000 kg');
  }

  const extraWeight = Math.max(0, weight - 0.5);
  const perKgRate = type === 'express' ? 60 : type === 'oversized' ? 18 : 30;
  return Math.round(baseRates[type] + Math.round(extraWeight * perKgRate));
};
