// src/components/Supplier/SupplierForm.jsx
import React from 'react';
import styles from './SupplierForm.module.css';

function SupplierForm({ form, editingId, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className={styles.supplierForm}>
      {/* Field: Tên */}
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.formLabel}>Tên nhà cung cấp *</label>
        <input 
          id="name"
          name="name" 
          placeholder="Nhập tên nhà cung cấp" 
          value={form.name} 
          onChange={onChange} 
          required 
          className={styles.formInput}
        />
      </div>

      {/* Field: Email */}
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.formLabel}>Email</label>
        <input 
          id="email"
          name="email" 
          type="email"
          placeholder="Nhập email" 
          value={form.email} 
          onChange={onChange} 
          className={styles.formInput}
        />
      </div>

      {/* Field: Số điện thoại */}
      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.formLabel}>Số điện thoại</label>
        <input 
          id="phone"
          name="phone" 
          type="tel"
          placeholder="Nhập số điện thoại" 
          value={form.phone} 
          onChange={onChange} 
          className={styles.formInput}
        />
      </div>

      {/* Field: Địa chỉ */}
      <div className={styles.formGroup}>
        <label htmlFor="address" className={styles.formLabel}>Địa chỉ</label>
        <input 
          id="address"
          name="address" 
          placeholder="Nhập địa chỉ" 
          value={form.address} 
          onChange={onChange} 
          className={styles.formInput}
        />
      </div>

      {/* Field: Ghi chú */}
      <div className={styles.formGroup}>
        <label htmlFor="note" className={styles.formLabel}>Ghi chú</label>
        <textarea 
          id="note"
          name="note" 
          placeholder="Nhập ghi chú..." 
          value={form.note} 
          onChange={onChange} 
          rows={3}
          className={styles.formTextarea}
        />
      </div>

      {/* Buttons - Di chuyển vào footer modal nếu muốn, nhưng giữ trong form */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={!editingId} // Ẩn nếu không edit
          style={{ display: editingId ? 'block' : 'none' }}
        >
          ❌ Hủy
        </button>
        <button
          type="submit"
          className={`${styles.actionButton} ${editingId ? styles.updateButton : styles.addButton}`}
          disabled={!form.name} // Disable nếu thiếu tên
        >
          {editingId ? "💾 Cập nhật" : "➕ Thêm"}
        </button>
      </div>
    </form>
  );
}

export default SupplierForm;