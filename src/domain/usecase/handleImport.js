import { getSupplierById, addSupplier } from "../../services/supplierService";
import { addProduct, updateProduct, getProductById } from "../../services/productService";
import { addImportRecord } from "../../services/importService";
import { generateSKU } from "../../utils/skuUtils";
import { calculateSellingPrice } from "../../utils/priceUtils";
import { ImportReceipt } from "../../models/ImportReceipt";

export const handleImport = async (data) => {
    const TAX_RATE = parseFloat(import.meta.env.VITE_TAX_RATE || 0.015);

    try {
        console.log("🔹 Import Data:", data);

        // 1️⃣ Kiểm tra hoặc tạo nhà cung cấp
        let supplier = await getSupplierById(data.supplierId);
        if (!supplier) supplier = await addSupplier({ name: data.supplierId });

        const importedItems = [];

        for (const item of data.items) {
            let productData;
            const productId = item.productId;

            if (productId) {
                const existing = await getProductById(productId);
                const newStock = Number(existing.totalInStock || 0) + Number(item.quantity);

                const newAvgPrice = (
                    (existing.averageImportPrice * existing.totalInStock + item.importPrice * item.quantity) /
                    newStock
                ).toFixed(2);

                const newHighestPrice = Math.max(existing.highestImportPrice || 0, item.importPrice);

                await updateProduct(productId, {
                    totalInStock: newStock,
                    averageImportPrice: Number(newAvgPrice),
                    highestImportPrice: newHighestPrice,
                    sellingPrice: calculateSellingPrice(newHighestPrice, item.profitPercent, TAX_RATE),
                    profitPercent: item.profitPercent,
                });

                productData = {
                    ...existing,
                    importQuantity: item.quantity,
                    importPrice: item.importPrice,
                    sellingPrice: calculateSellingPrice(newHighestPrice, item.profitPercent, TAX_RATE),
                };
            } else {
                const sku = generateSKU(item.category?.substring(0, 2)?.toUpperCase() || "SP");

                const newProduct = await addProduct({
                    name: item.productName,
                    sku,
                    totalInStock: item.quantity,
                    totalSold: 0,
                    averageImportPrice: item.importPrice,
                    highestImportPrice: item.importPrice,
                    profitPercent: item.profitPercent,
                    sellingPrice: calculateSellingPrice(item.importPrice, item.profitPercent, TAX_RATE),
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

        const importReceipt = new ImportReceipt({
            supplierId: supplier.id || data.supplierId,
            supplierName: supplier.name,
            items: importedItems,
        });

        await addImportRecord(importReceipt);

        return { success: true, message: "✅ Nhập hàng thành công!" };
    } catch (err) {
        console.error("❌ Lỗi khi nhập hàng:", err);
        return { success: false, message: "Lỗi khi nhập hàng!" };
    }
};
