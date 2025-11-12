// src/components/Supplier/SupplierList.jsx
import React from "react";
import styles from "./SupplierList.module.css"; // 👈 Import CSS Module

function SupplierList({ suppliers, onEdit, onDelete }) {
  if (suppliers.length === 0) {
    return <p>Chưa có nhà cung cấp nào được thêm.</p>;
  }

  return (
    <ul className={styles.supplierList}>
      {suppliers.map((s) => (
        <li className={styles.supplierItem} key={s.id}>
          <span className={styles.supplierName}>{s.name}</span>

          <div className={styles.supplierInfo}>
            <div className={styles.supplierDetail}>📧 Email: {s.email}</div>
            <div className={styles.supplierDetail}>📞 SĐT: {s.phone}</div>
            <div className={styles.supplierDetail}>📍 Địa chỉ: {s.address}</div>
            <div className={styles.supplierDetail}>📝 Ghi chú: {s.note}</div>
          </div>

          <div className={styles.actionButtons}>
            <button onClick={() => onEdit(s)}>✏️ Sửa</button>
            <button onClick={() => onDelete(s.id)}>🗑️ Xóa</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default SupplierList;
