import { db } from "../firebaseConfig";
import { collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";
import { addProduct, updateProduct, getProductById } from "./productService";
import { getSupplierById, addSupplier } from "./supplierService";
import { generateSKU } from "../utils/skuUtils";

// 💰 Tính giá bán có thuế
function calculateSellingPrice(importPrice, profitPercent, TAX_RATE) {
  const priceBeforeTax = Number(importPrice) * (1 + profitPercent / 100);
  return priceBeforeTax * (1 + TAX_RATE);
};

/**
 * Xử lý nhập hàng: thêm/cập nhật sản phẩm và tạo phiếu nhập.
 * @param {Object} data - Dữ liệu nhập hàng
 * @returns {Object} Kết quả { success, message }
 */
export const handleImport = async (data) => {
  const TAX_RATE = parseFloat(import.meta.env.VITE_TAX_RATE || 0.015);
  const importRef = collection(db, "imports");

  try {
    console.log("🔹 Import Data:", data);

    // ✅ 1. Kiểm tra hoặc thêm nhà cung cấp
    let supplier = await getSupplierById(data.supplierId);
    if (!supplier) {
      supplier = await addSupplier({ name: data.supplierId });
    }

    // ✅ 2. Danh sách sản phẩm sau khi xử lý
    const importedItems = [];

    for (const item of data.items) {
      let productData;
      const productId = item.productId;

      if (productId) {
        //Lấy thông tin sản phẩm hiện có
        const existingProduct = await getProductById(productId);

        const newStock = Number(existingProduct.totalInStock || 0) + Number(item.quantity);
        const newAvgPrice = Number(
          (existingProduct.averageImportPrice * existingProduct.totalInStock +
            item.importPrice * item.quantity) /
          newStock
        ).toFixed(2);

        const newHighestPrice = Number(Math.max(
          existingProduct.highestImportPrice || 0,
          item.importPrice
        ));

        await updateProduct(productId, {
          totalInStock: Number(newStock),
          averageImportPrice: Number(newAvgPrice),
          highestImportPrice: Number(newHighestPrice),
          sellingPrice: calculateSellingPrice(
            newHighestPrice,
            item.profitPercent,
            TAX_RATE
          ),
          profitPercent: item.profitPercent,
        });

        // ✅ Ghi lại bản snapshot sản phẩm tại thời điểm nhập
        productData = {
          ...existingProduct,
          importQuantity: item.quantity,
          importPrice: item.importPrice,
          sellingPrice: calculateSellingPrice(
            newHighestPrice,
            item.profitPercent,
            TAX_RATE
          ),
        };
      } else {
        // 🔹 Sản phẩm mới => tạo mới hoàn toàn
        const sku = generateSKU(item.category?.substring(0, 2)?.toUpperCase() || "SP");

        const newProduct = await addProduct({
          name: item.productName,
          sku,
          totalInStock: item.quantity,
          totalSold: 0,
          averageImportPrice: item.importPrice,
          highestImportPrice: item.importPrice,
          profitPercent: item.profitPercent,
          sellingPrice: calculateSellingPrice(
            item.importPrice,
            item.profitPercent,
            TAX_RATE
          ),
          category: item.category || "",
          unit: item.unit || "Cái",
          supplier: supplier.name,
        });

        productData = {
          ...newProduct,
          importQuantity: item.quantity,
          importPrice: item.importPrice,
        };
      }

      importedItems.push(productData);
    }

    // ✅ 3. Lưu phiếu nhập vào Firestore
    await addDoc(importRef, {
      supplierId: supplier.id || data.supplierId,
      supplierName: supplier.name,
      items: importedItems,
      createdAt: new Date(),
    });

    return { success: true, message: "✅ Nhập hàng thành công!" };
  } catch (err) {
    console.error("❌ Lỗi khi nhập hàng:", err);
    return { success: false, message: "Lỗi khi nhập hàng!" };
  }
};

export const getImports = async () => {
  const importRef = collection(db, "imports");
  const q = query(importRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};