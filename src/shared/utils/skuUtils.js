// utils/skuUtils.js
export function generateSKU(productName) {
  const prefix = productName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 3);

  const random = Math.floor(100 + Math.random() * 900); // 3 chữ số
  return `${prefix}-${random}`;
}
