// 💰 Hàm tính giá bán có thuế
export function calculateSellingPrice(importPrice, profitPercent, TAX_RATE = import.meta.env.VITE_TAX_RATE) {
  const priceBeforeTax = Number(importPrice) * (1 + profitPercent / 100);
  return priceBeforeTax * (1 + TAX_RATE);
}
