export const filterByLowStock = (threshold = 10) => (p) =>
  Number(p.totalInStock || 0) <= threshold;

export const searchByKeyword = (keyword) => (p) =>
  p.name.toLowerCase().includes(keyword.toLowerCase());
