import React, { useState, useMemo } from "react";
import { MdAdd, MdArrowBack } from "react-icons/md";
import { useCategories } from "@features/Category/hooks/useCategories";

import Modal from "@components/Modal";
import ProductList from "@features/Product/components/ProductList/ProductList";
import CategoriesList from "@features/Category/components/CategoriesList/CategoriesList";
import CategoryForm from "@features/Category/components/CategoryForm/CategoryForm";

import styles from "./Categories.module.css";

export default function Categories() {
  const { categories, products, loading, createCategory, editCategory, removeCategory } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  const handleOpenForm = (category = null) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleViewCategory = (category) => {
    setViewingCategory(category.name);
  };

  const handleBack = () => {
    setViewingCategory(null);
  };

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === viewingCategory),
    [products, viewingCategory]
  );

  return (
    <div className={styles.categoriesPage}>
      {viewingCategory ? (
        <>
          <div className={styles.pageHeader}>
            <button onClick={handleBack} className={styles.backBtn}>
              <MdArrowBack /> Quay lại
            </button>
            <h1>Sản phẩm - {viewingCategory}</h1>
          </div>
          <ProductList products={categoryProducts} />
        </>
      ) : (
        <>
          <div className={styles.headerRow}>
            <h1>Quản lý phân loại sản phẩm</h1>
            <div>
              <button onClick={() => handleOpenForm()} className={styles.addBtn}>
                <MdAdd /> Thêm phân loại
              </button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Đang tải...</div>
          ) : categories.length === 0 ? (
            <div className={styles.empty}>Chưa có phân loại nào.</div>
          ) : (
            <CategoriesList
              categories={categories}
              onView={handleViewCategory}
              onEdit={handleOpenForm}
              onDelete={removeCategory}
            />
          )}
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCategory ? "Sửa phân loại" : "Thêm phân loại mới"}>
        <CategoryForm
          category={editingCategory}
          onSubmit={(data) => {
            if (editingCategory) {
              editCategory(editingCategory, data);
            } else {
              createCategory(data);
            }
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
}
