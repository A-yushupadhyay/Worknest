// /backend/lib/cache.js
// Lightweight cache wrapper. For dev we use node-cache. Replace with Redis client for production.
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 15, checkperiod: 30 }); // 15s ttl by default

module.exports = {
  get(key) { return cache.get(key); },
  set(key, value, ttl = undefined) { return cache.set(key, value, ttl); },
  del(key) { return cache.del(key); },
  flush() { return cache.flushAll(); }
};
