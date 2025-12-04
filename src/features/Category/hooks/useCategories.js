import { useState, useEffect, useCallback } from "react";
import { getAllProducts, updateProduct } from "@services/productService";
import {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryByName,
} from "@services/categoryService";
import { buildCategoryMap } from "@features/Category/helpers/helpers";

/**
 * useCategories - hook quản lý toàn bộ nghiệp vụ cho page Categories
 */
export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const allProducts = await getAllProducts();
            const activeProducts = (allProducts || []).filter((p) => !p.isDeleted);
            setProducts(activeProducts);

            const categoriesFromDB = await getAllCategories();
            setCategories(buildCategoryMap(categoriesFromDB, activeProducts));
        } catch (err) {
            console.error("useCategories.loadData:", err);
            alert("Lỗi khi tải dữ liệu phân loại");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const createCategory = async ({ name, description = "" }) => {
        setLoading(true);
        try {
            // Guard duplicate at service level first
            const existing = await getCategoryByName(name.trim());
            if (existing) {
                alert("Phân loại này đã tồn tại");
                return;
            }
            await addCategory({ name: name.trim(), description });
            await loadData();
            alert("Thêm phân loại thành công");
        } catch (err) {
            console.error("createCategory:", err);
            alert("Lỗi khi thêm phân loại");
        } finally {
            setLoading(false);
        }
    };

    const editCategory = async (oldCategory, { name, description = "" }) => {
        setLoading(true);
        try {
            if (name.trim() === oldCategory.name) {
                // nothing to change on name
                if (oldCategory.id) {
                    await updateCategory(oldCategory.id, { description });
                }
                await loadData();
                setLoading(false);
                return;
            }

            const existing = await getCategoryByName(name.trim());
            if (existing) {
                alert("Phân loại này đã tồn tại");
                setLoading(false);
                return;
            }

            if (oldCategory.id) {
                await updateCategory(oldCategory.id, { name: name.trim(), description });
            }

            // update products referencing oldCategory.name -> new name
            const related = products.filter((p) => p.category === oldCategory.name);
            if (related.length > 0) {
                await Promise.all(
                    related.map((p) => updateProduct(p.id, { ...p, category: name.trim() }))
                );
            }

            await loadData();
            alert("Cập nhật phân loại thành công");
        } catch (err) {
            console.error("editCategory:", err);
            alert("Lỗi khi cập nhật phân loại");
        } finally {
            setLoading(false);
        }
    };

    const removeCategory = async (categoryName) => {
        const related = products.filter((p) => p.category === categoryName);
        if (related.length > 0) {
            alert(`Không thể xóa phân loại này vì còn ${related.length} sản phẩm.`);
            return;
        }

        if (!window.confirm(`Bạn có chắc muốn xóa phân loại "${categoryName}"?`)) return;

        setLoading(true);
        try {
            const target = categories.find((c) => c.name === categoryName);
            if (target?.id) {
                await deleteCategory(target.id);
            }
            await loadData();
            alert("Xóa phân loại thành công!");
        } catch (err) {
            console.error("removeCategory:", err);
            alert("Lỗi khi xóa phân loại");
        } finally {
            setLoading(false);
        }
    };

    return {
        categories,
        products,
        loading,
        loadData,
        createCategory,
        editCategory,
        removeCategory,
    };
}
