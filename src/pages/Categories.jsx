import React, { useState, useEffect } from "react";
import { MdAdd, MdDelete, MdEdit, MdArrowBack } from "react-icons/md";
import { getAllProducts, updateProduct } from "../services/productService";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import Modal from "../components/Modal";
import ProductList from "../components/Product/ProductList";
import styles from "./Categories.module.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [viewingCategory, setViewingCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  // Tải danh sách sản phẩm và phân loại từ Firebase
  const loadCategories = async () => {
    setLoading(true);
    try {
      // Lấy tất cả sản phẩm
      const allProducts = await getAllProducts();
      const activeProducts = allProducts.filter((p) => !p.isDeleted);
      setProducts(activeProducts);

      // Lấy phân loại từ Firestore
      const categoriesFromDB = await getAllCategories();
      const categoryMap = {};

      // Thêm phân loại từ DB
      categoriesFromDB.forEach((cat) => {
        categoryMap[cat.name] = {
          name: cat.name,
          description: cat.description || "",
          productCount: 0,
          id: cat.id,
        };
      });

      // Đếm sản phẩm cho mỗi phân loại
      activeProducts.forEach((p) => {
        const cat = p.category || "Không phân loại";
        if (!categoryMap[cat]) {
          categoryMap[cat] = {
            name: cat,
            description: "",
            productCount: 0,
            id: null, // Phân loại không được ghi lại từ DB
          };
        }
        categoryMap[cat].productCount += 1;
      });

      setCategories(
        Object.values(categoryMap).sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      console.error("Error loading categories:", err);
      alert("Lỗi khi tải danh sách phân loại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Tên phân loại không được để trống");
      return;
    }

    if (categories.some((c) => c.name === newCategoryName)) {
      alert("Phân loại này đã tồn tại");
      return;
    }

    setLoading(true);
    addCategory({ name: newCategoryName, description: "" })
      .then(() => {
        setNewCategoryName("");
        setShowForm(false);
        alert("Thêm phân loại thành công!");
        loadCategories();
      })
      .catch((err) => {
        console.error("Error adding category:", err);
        alert("Lỗi khi thêm phân loại");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      alert("Tên phân loại không được để trống");
      return;
    }

    if (newCategoryName === editingCategory.name) {
      setEditingCategory(null);
      setNewCategoryName("");
      setShowForm(false);
      return;
    }

    if (categories.some((c) => c.name === newCategoryName)) {
      alert("Phân loại này đã tồn tại");
      return;
    }

    setLoading(true);
    try {
      // Cập nhật tên phân loại trong Firebase (nếu có ID)
      if (editingCategory.id) {
        await updateCategory(editingCategory.id, { name: newCategoryName });
      }

      // Cập nhật tất cả sản phẩm có phân loại cũ
      const productsToUpdate = products.filter(
        (p) => p.category === editingCategory.name
      );
      await Promise.all(
        productsToUpdate.map((p) =>
          updateProduct(p.id, { ...p, category: newCategoryName })
        )
      );

      setEditingCategory(null);
      setNewCategoryName("");
      setShowForm(false);
      alert("Cập nhật phân loại thành công!");
      await loadCategories();
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
        `Không thể xóa phân loại này vì còn ${productsInCategory.length} sản phẩm. Vui lòng chuyển sang phân loại khác trước.`
      );
      return;
    }

    if (window.confirm(`Bạn có chắc muốn xóa phân loại "${categoryName}"?`)) {
      setLoading(true);
      try {
        // Tìm và xóa phân loại từ DB (nếu có)
        const categoryToDelete = categories.find((c) => c.name === categoryName);
        if (categoryToDelete && categoryToDelete.id) {
          await deleteCategory(categoryToDelete.id);
        }

        setCategories(categories.filter((c) => c.name !== categoryName));
        alert("Xóa phân loại thành công!");
        await loadCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Lỗi khi xóa phân loại");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setNewCategoryName("");
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

          <button
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName("");
              setShowForm(true);
            }}
            className={styles.addBtn}
          >
            <MdAdd /> Thêm phân loại
          </button>

          {loading && <p className={styles.loading}>Đang tải...</p>}

          {!loading && categories.length === 0 ? (
            <p className={styles.noData}>Chưa có phân loại nào.</p>
          ) : (
            <div className={styles.categoriesList}>
              {categories.map((category) => (
                <div key={category.name} className={styles.categoryCard}>
                  <div
                    className={styles.categoryInfo}
                    onClick={() => handleViewCategory(category)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleViewCategory(category);
                      }
                    }}
                  >
                    <h3>{category.name}</h3>
                    <p>{category.productCount} sản phẩm</p>
                  </div>
                  <div className={styles.categoryActions}>
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setNewCategoryName(category.name);
                        setShowForm(true);
                      }}
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      title="Sửa"
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.name)}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      title="Xóa"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingCategory ? "Sửa phân loại" : "Thêm phân loại mới"}
      >
        <div className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label>Tên phân loại</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nhập tên phân loại"
              className={styles.input}
            />
          </div>
          <div className={styles.formActions}>
            <button onClick={handleCloseForm} className={styles.cancelBtn} disabled={loading}>
              Hủy
            </button>
            <button
              onClick={editingCategory ? handleEditCategory : handleAddCategory}
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : editingCategory ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
