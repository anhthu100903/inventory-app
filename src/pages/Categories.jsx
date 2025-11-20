// src/pages/Categories.jsx
import React, { useState, useEffect } from "react";
import { MdAdd, MdArrowBack } from "react-icons/md";
import { getAllProducts, updateProduct } from "../services/productService";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import Modal from "../components/Modal";
import ProductList from "../components/Product/ProductList"; // Added import
import CategoriesList from "../components/Category/CategoriesList";
import CategoryForm from "../components/Category/CategoryForm";
import styles from "./Categories.module.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  // Load categories and products
  const loadData = async () => {
    setLoading(true);
    try {
      const allProducts = await getAllProducts();
      const activeProducts = allProducts.filter((p) => !p.isDeleted);
      setProducts(activeProducts);

      const categoriesFromDB = await getAllCategories();
      const categoryMap = {};

      categoriesFromDB.forEach((cat) => {
        categoryMap[cat.name] = {
          name: cat.name,
          description: cat.description || "",
          productCount: 0,
          id: cat.id,
        };
      });

      activeProducts.forEach((p) => {
        const cat = p.category || "Không phân loại";
        if (!categoryMap[cat]) {
          categoryMap[cat] = {
            name: cat,
            description: "",
            productCount: 0,
            id: null,
          };
        }
        categoryMap[cat].productCount += 1;
      });

      setCategories(
        Object.values(categoryMap).sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      console.error("Error loading data:", err);
      alert("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async (formData) => {
    if (categories.some((c) => c.name === formData.name)) {
      alert("Phân loại này đã tồn tại");
      return;
    }

    setLoading(true);
    try {
      await addCategory(formData);
      setShowForm(false);
      alert("Thêm phân loại thành công!");
      await loadData();
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Lỗi khi thêm phân loại");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (formData) => {
    if (formData.name === editingCategory.name) {
      setShowForm(false);
      return;
    }

    if (categories.some((c) => c.name === formData.name)) {
      alert("Phân loại này đã tồn tại");
      return;
    }

    setLoading(true);
    try {
      if (editingCategory.id) {
        await updateCategory(editingCategory.id, formData);
      }

      const productsToUpdate = products.filter(
        (p) => p.category === editingCategory.name
      );
      await Promise.all(
        productsToUpdate.map((p) =>
          updateProduct(p.id, { ...p, category: formData.name })
        )
      );

      setShowForm(false);
      alert("Cập nhật phân loại thành công!");
      await loadData();
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Lỗi khi cập nhật phân loại");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    const productsInCategory = products.filter((p) => p.category === categoryName);

    if (productsInCategory.length > 0) {
      alert(
        `Không thể xóa phân loại này vì còn ${productsInCategory.length} sản phẩm.`
      );
      return;
    }

    if (window.confirm(`Bạn có chắc muốn xóa phân loại "${categoryName}"?`)) {
      setLoading(true);
      try {
        const categoryToDelete = categories.find((c) => c.name === categoryName);
        if (categoryToDelete && categoryToDelete.id) {
          await deleteCategory(categoryToDelete.id);
        }

        await loadData();
        alert("Xóa phân loại thành công!");
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Lỗi khi xóa phân loại");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewCategory = (category) => {
    const productsInCat = products.filter((p) => p.category === category.name);
    setCategoryProducts(productsInCat);
    setViewingCategory(category.name);
  };

  const handleBackToCategoryList = () => {
    setViewingCategory(null);
    setCategoryProducts([]);
  };

  const handleOpenForm = (category = null) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  return (
    <div className={styles.categoriesPage}>
      {viewingCategory ? (
        <>
          <div className={styles.pageHeader}>
            <button onClick={handleBackToCategoryList} className={styles.backBtn}>
              <MdArrowBack /> Quay lại
            </button>
            <h1>Sản phẩm - {viewingCategory}</h1>
          </div>
          <ProductList products={categoryProducts} />
        </>
      ) : (
        <>
          <h1>Quản lý phân loại sản phẩm</h1>

          <div className={styles.toolbar}>
            <div className={styles.actionGroup}>
              <button
                onClick={() => handleOpenForm()}
                className={styles.addBtn}
              >
                <MdAdd /> Thêm phân loại
              </button>
            </div>
          </div>

          {loading && <div className={styles.loading}>Đang tải...</div>}

          {!loading && categories.length === 0 ? (
            <div className={styles.empty}>Chưa có phân loại nào.</div>
          ) : (
            <CategoriesList
              categories={categories}
              onView={handleViewCategory}
              onEdit={handleOpenForm}
              onDelete={handleDeleteCategory}
            />
          )}
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCategory ? "Sửa phân loại" : "Thêm phân loại mới"}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
}