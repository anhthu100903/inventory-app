export const validateProduct = (product) => {
  if (!product.name || product.name.trim() === "")
    throw new Error("Tên sản phẩm không được để trống");

  if (product.importPrice < 0) throw new Error("Giá nhập không hợp lệ");
  if (product.sellingPrice < 0) throw new Error("Giá bán không hợp lệ");

  return true;
};
