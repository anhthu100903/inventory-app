// src/components/Category/CategoryForm.jsx
import React from "react";
import styles from "./CategoryForm.module.css";

export default function CategoryForm({ category, onSubmit, onCancel, loading }) {
  const [newCategoryName, setNewCategoryName] = React.useState(category?.name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert("Tên phân loại không được để trống");
      return;
    }
    onSubmit({ name: newCategoryName });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="categoryName">Tên phân loại</label>
        <input
          id="categoryName"
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nhập tên phân loại"
          className={styles.input}
          disabled={loading}
        />
      </div>
      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={loading}>
          Hủy
        </button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Đang xử lý..." : category ? "Cập nhật" : "Thêm"}
        </button>
      </div>
    </form>
  );
}