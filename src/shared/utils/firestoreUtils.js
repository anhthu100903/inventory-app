// Utility helpers for preparing data for Firestore writes

export function isFirestoreTimestampLike(v) {
  return v && typeof v.toDate === "function";
}

export function sanitizeForFirestore(val) {
  // Convert undefined -> null, preserve Date and Firestore Timestamp-like objects
  if (val === undefined) return null;
  if (val === null) return null;
  if (val instanceof Date) return val;
  if (isFirestoreTimestampLike(val)) return val;
  if (Array.isArray(val)) return val.map(sanitizeForFirestore);
  if (typeof val === "object") {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = sanitizeForFirestore(v);
    }
    return out;
  }
  return val;
}

export function ensureSupplierId(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (obj.id === undefined) obj.id = null;
  return obj;
}
