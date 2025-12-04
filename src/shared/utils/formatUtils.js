export function formatCurrency(value) {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0.000";
  return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

export function toSafeDate(d) {
  if (!d) return null;
  // Firestore Timestamp has toDate()
  if (typeof d.toDate === 'function') return d.toDate();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}
