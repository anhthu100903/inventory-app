// src/components/Supplier/SupplierList.jsx
import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { createPortal } from "react-dom";
import styles from "./SupplierList.module.css";

export default function SupplierList({ suppliers = [], onEdit, onDelete }) {
  const [showDropdownId, setShowDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleDocClick = () => setShowDropdownId(null);
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    if (btn && btn.getBoundingClientRect) {
      const r = btn.getBoundingClientRect();
      setDropdownPos({
        top: r.bottom + window.scrollY,
        left: r.left + window.scrollX,
        right: window.innerWidth - r.right,
      });
    }
    setShowDropdownId((prev) => (prev === id ? null : id));
  };

  const handleAction = (action, supplier) => {
    setShowDropdownId(null);
    switch (action) {
      case "edit":
        onEdit?.(supplier);
        break;
      case "delete":
        onDelete?.(supplier.id);
        break;
      default:
        break;
    }
  };

  if (suppliers.length === 0) {
    return <div className={styles.empty}>Chưa có nhà cung cấp nào.</div>;
  }

  return (
    <div className={styles.supplierList}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên nhà cung cấp</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th className={styles.hideOnMobile}>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((supplier, index) => {
              const isShown = showDropdownId === supplier.id && dropdownPos;
              let portal = null;

              if (isShown) {
                const style = { position: "absolute", top: dropdownPos.top + "px" };
                const RIGHT_THRESHOLD = 150;
                if (typeof dropdownPos.right === "number" && dropdownPos.right < RIGHT_THRESHOLD) {
                  style.right = dropdownPos.right + "px";
                } else {
                  const leftVal = Math.max(8, dropdownPos.left);
                  style.left = leftVal + "px";
                }

                portal = createPortal(
                  <div
                    className={styles.dropdown}
                    style={style}
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <button
                      onClick={() => handleAction("edit", supplier)}
                      className={`${styles.dropdownItem} ${styles.editItem}`}
                    >
                      <MdEdit /> Sửa
                    </button>
                    <button
                      onClick={() => handleAction("delete", supplier)}
                      className={`${styles.dropdownItem} ${styles.deleteItem}`}
                    >
                      <MdDelete /> Xóa
                    </button>
                  </div>,
                  document.body
                );
              }

              return (
                <tr key={supplier.id} className={styles.row}>
                  <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                  <td className={styles.supplierName}>{supplier.name}</td>
                  <td>{supplier.email || "-"}</td>
                  <td>{supplier.phone || "-"}</td>
                  <td>{supplier.address || "-"}</td>
                  <td className={styles.hideOnMobile}>{supplier.note || "-"}</td>
                  <td className={styles.actionCell}>
                    {/* Desktop buttons */}
                    <button
                      onClick={() => onEdit?.(supplier)}
                      title="Sửa"
                      className={`${styles.actionButton} ${styles.editButton}`}
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={() => onDelete?.(supplier.id)}
                      title="Xóa"
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      <MdDelete />
                    </button>

                    {/* Mobile More button */}
                    <button
                      onClick={(e) => toggleDropdown(e, supplier.id)}
                      title="Tùy chọn"
                      className={styles.moreButton}
                    >
                      <MdMoreVert />
                    </button>

                    {portal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {suppliers.length > ITEMS_PER_PAGE && (
        <div className={styles.pagination}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</button>
          <span>Trang {currentPage} / {Math.ceil(suppliers.length / ITEMS_PER_PAGE)}</span>
          <button disabled={currentPage === Math.ceil(suppliers.length / ITEMS_PER_PAGE)} onClick={() => setCurrentPage((p) => Math.min(Math.ceil(suppliers.length / ITEMS_PER_PAGE), p + 1))}>Next</button>
        </div>
      )}
    </div>
  );
}