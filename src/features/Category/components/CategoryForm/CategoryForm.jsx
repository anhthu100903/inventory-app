import React, { useEffect, useState } from "react";
import styles from "./CategoryForm.module.css";
import { validateCategoryName } from "@features/Category/helpers/helpers";

export default function CategoryForm({ category = null, onSubmit, onCancel, loading = false }) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(category?.name || "");
    setDescription(category?.description || "");
    setError(null);
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validateCategoryName(name);
    if (!v.ok) {
      setError(v.message);
      return;
    }
    setError(null);
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="catName">Tên phân loại</label>
        <input id="catName" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="catDesc">Mô tả (tuỳ chọn)</label>
        <textarea id="catDesc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>Hủy</button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? "Đang xử lý..." : (category ? "Cập nhật" : "Thêm")}</button>
      </div>
    </form>
  );
}
