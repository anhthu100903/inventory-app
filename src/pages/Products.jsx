import React, { useState, useEffect } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import Modal from "../components/Modal";
import ProductForm from "../components/Product/ProductForm";
import ProductList from "../components/Product/ProductList";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import styles from "./Products.module.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Tải danh sách sản phẩm và phân loại
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      // Lọc bỏ sản phẩm đã xóa
      const activeProducts = data.filter((p) => !p.isDeleted);
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);

      const cats = await getAllCategories();
      // Chuyển đổi Category objects thành tên chuỗi
      const categoryNames = cats.map((cat) => cat.name);
      setCategories(categoryNames);
    } catch (err) {
      console.error("Error loading products:", err);
      alert("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Lọc sản phẩm theo phân loại và tìm kiếm
  useEffect(() => {
    let filtered = products;

    // Lọc theo phân loại
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Lọc theo tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const handleAddProduct = async (data) => {
    setLoading(true);
    try {
      await addProduct(data);
      await loadProducts();
      setShowForm(false);
      alert("Thêm sản phẩm thành công!");
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Lỗi khi thêm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleUpdateProduct = async (data) => {
    if (!editingProduct) return;
    setLoading(true);
    try {
      await updateProduct(editingProduct.id, data);
      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
      alert("Cập nhật sản phẩm thành công!");
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Lỗi khi cập nhật sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      await loadProducts();
      alert("Xóa sản phẩm thành công!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Lỗi khi xóa sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className={styles.productsPage}>
      <h1>Quản lý sản phẩm</h1>

      {/* Thanh công cụ */}
      <div className={styles.toolbar}>
        <div className={styles.filterSection}>
          {/* Tìm kiếm */}
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

          {/* Phân loại */}
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

        {/* Nút thêm */}
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className={styles.addBtn}
        >
          <MdAdd /> Thêm sản phẩm
        </button>
      </div>

      {/* Danh sách sản phẩm */}
      {loading && !showForm ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : (
        <ProductList
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
      >
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={handleCloseForm}
          loading={loading}
        />
      </Modal>
    </div>
  );
}


