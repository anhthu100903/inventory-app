// inventory-app/src/pages/Product/Products.jsx

import React from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import Modal from "@components/Modal";
import ProductForm from "@features/Product/components/ProductForm/ProductForm";
import ProductList from "@features/Product/components/ProductList/ProductList";
import useProducts from "@features/Product/hooks/useProducts";
import styles from "./Products.module.css";

export default function Products() {
  const {
    products,
    categories,

    selectedCategory,
    setSelectedCategory,

    searchQuery,
    setSearchQuery,

    showForm,
    setShowForm,

    editingProduct,
    openEdit,
    closeForm,

    loading,

    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  } = useProducts();

  return (
    <div className={styles.productsPage}>
      <h1>Quản lý sản phẩm</h1>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filterSection}>
          {/* Search */}
          <div className={styles.searchBox}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm tên sản phẩm hoặc SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}
          >
            <option value="">-- Tất cả phân loại --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Add button */}
        <button
          onClick={() => {
            setShowForm(true);
          }}
          className={styles.addBtn}
        >
          <MdAdd /> Thêm sản phẩm
        </button>
      </div>

      {/* List */}
      {loading && !showForm ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : (
        <ProductList
          products={products}
          onEdit={openEdit}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Modal form */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
      >
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={closeForm}
          loading={loading}
        />
      </Modal>
    </div>
  );
}
