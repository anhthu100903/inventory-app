export const calculateSellingPrice = (importPrice, profitPercent, taxRate = 0) => {
  const importPriceNum = Number(importPrice) || 0;
  const profitNum = Number(profitPercent) || 10;
  const base = importPriceNum * (1 + profitNum / 100);
  const calculatedPrice = base * (1 + taxRate);
  return calculatedPrice > 0 ? calculatedPrice.toFixed(0) : 0;
};
