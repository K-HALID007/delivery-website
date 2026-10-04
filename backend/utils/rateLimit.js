const requestWindows = new Map();

export function consumeRateLimit(key, { limit, windowMs, now = Date.now(), store = requestWindows }) {
  const current = store.get(key);
  if (!current || now >= current.resetAt) {
    const next = { count: 1, resetAt: now + windowMs };
    store.set(key, next);
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function createRateLimiter({ limit, windowMs, keyPrefix }) {
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
    if (requestWindows.size > 10000) {
      const now = Date.now();
      for (const [storedKey, entry] of requestWindows) {
        if (entry.resetAt <= now) requestWindows.delete(storedKey);
      }
    }
    const result = consumeRateLimit(key, { limit, windowMs });
    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(result.remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
    if (!result.allowed) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))));
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    }
    return next();
  };
}
