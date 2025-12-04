// src/features/Supplier/components/SupplierForm/SupplierForm.jsx
import React from "react";
import styles from "./SupplierForm.module.css";

export default function SupplierForm({
  form,
  editingId,
  onChange,
  onSubmit,
  onCancel,
}) {
  const safe = (v) => (v == null ? "" : v);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.supplierForm}>
      {/* Name */}
      <FormField
        label="Tên nhà cung cấp *"
        id="name"
        name="name"
        required
        value={safe(form?.name)}
        onChange={onChange}
      />

      {/* Email */}
      <FormField
        label="Email"
        id="email"
        type="email"
        name="email"
        value={safe(form?.email)}
        onChange={onChange}
      />

      {/* Phone */}
      <FormField
        label="Số điện thoại"
        id="phone"
        type="tel"
        name="phone"
        value={safe(form?.phone)}
        onChange={onChange}
      />

      {/* Address */}
      <FormField
        label="Địa chỉ"
        id="address"
        name="address"
        value={safe(form?.address)}
        onChange={onChange}
      />

      {/* Note */}
      <div className={styles.formGroup}>
        <label htmlFor="note" className={styles.formLabel}>Ghi chú</label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Nhập ghi chú..."
          className={styles.formTextarea}
          value={safe(form?.note)}
          onChange={onChange}
        />
      </div>

      {/* Actions */}
      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          ❌ Hủy
        </button>

        <button
          type="submit"
          disabled={!form?.name}
          className={`${styles.actionButton} ${
            editingId ? styles.updateButton : styles.addButton
          }`}
        >
          {editingId ? "💾 Cập nhật" : "➕ Thêm"}
        </button>
      </div>
    </form>
  );
}

/* --------------------------- SMALL REUSABLE FIELD --------------------------- */
function FormField({
  label,
  id,
  name,
  type = "text",
  value,
  required,
  onChange,
}) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.formLabel}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className={styles.formInput}
      />
    </div>
  );
}
