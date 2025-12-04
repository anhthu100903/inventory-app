export const capitalizeText = (text) => {
  if (!text) return text;
  const lowercaseUnits = ["m", "cm", "mm", "km", "g", "kg", "l", "ml"];
  if (lowercaseUnits.includes(text.toLowerCase())) {
    return text.toLowerCase();
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
