import React, { useState, useEffect } from "react";
import { MdInfo, MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { createPortal } from "react-dom";
import styles from "./InvoiceList.module.css";

export default function InvoiceList({ invoices = [], loading = false, onView, onEdit, onDelete }) {
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

  const handleAction = (action, inv) => {
    setShowDropdownId(null);
    switch (action) {
      case "view":
        onView?.(inv);
        break;
      case "edit":
        onEdit?.(inv);
        break;
      case "delete":
        onDelete?.(inv);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.invoiceList}>
      <h2>Danh sách hóa đơn</h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : invoices.length === 0 ? (
        <p>Chưa có hóa đơn nào.</p>
      ) : (
        <>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Số hóa đơn</th>
                <th className={styles.hideOnMobile}>Ngày</th>
                <th className={styles.hideOnMobile}>Khách</th>
                <th>Số sản phẩm</th>
                <th>Tổng</th>
                <th className={styles.actionHeader}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((inv, i) => {
                const isShown = showDropdownId === inv.id && dropdownPos;
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
                        onClick={() => handleAction("view", inv)}
                        className={`${styles.dropdownItem} ${styles.viewItem}`}
                      >
                        <MdInfo /> Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleAction("edit", inv)}
                        className={`${styles.dropdownItem} ${styles.editItem}`}
                      >
                        <MdEdit /> Sửa
                      </button>
                      <button
                        onClick={() => handleAction("delete", inv)}
                        className={`${styles.dropdownItem} ${styles.deleteItem}`}
                      >
                        <MdDelete /> Xóa
                      </button>
                    </div>,
                    document.body
                  );
                }

                return (
                  <tr key={inv.id}>
                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                    <td className={styles.invoiceNumber}>{inv.invoiceNumber || inv.id}</td>
                    <td className={styles.hideOnMobile}>{inv.createdAt ? (typeof inv.createdAt.toDate === 'function' ? inv.createdAt.toDate().toLocaleString() : new Date(inv.createdAt).toLocaleString()) : "-"}</td>
                    <td className={styles.hideOnMobile}>{inv.customer || "-"}</td>
                    <td>{(inv.items || []).length}</td>
                    <td className={styles.amount}>{(inv.totalAmount || 0).toLocaleString()} ₫</td>
                    <td className={styles.actionCell}>
                      {/* Desktop buttons */}
                      <button
                        onClick={() => onView?.(inv)}
                        title="Xem chi tiết"
                        className={`${styles.actionButton} ${styles.viewButton}`}
                      >
                        <MdInfo />
                      </button>
                      <button
                        onClick={() => onEdit?.(inv)}
                        title="Sửa"
                        className={`${styles.actionButton} ${styles.editButton}`}
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => onDelete?.(inv)}
                        title="Xóa"
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        <MdDelete />
                      </button>

                      {/* Mobile More button */}
                      <button
                        onClick={(e) => toggleDropdown(e, inv.id)}
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
        {invoices.length > ITEMS_PER_PAGE && (
          <div className={styles.pagination}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</button>
            <span>Trang {currentPage} / {Math.ceil(invoices.length / ITEMS_PER_PAGE)}</span>
            <button disabled={currentPage === Math.ceil(invoices.length / ITEMS_PER_PAGE)} onClick={() => setCurrentPage((p) => Math.min(Math.ceil(invoices.length / ITEMS_PER_PAGE), p + 1))}>Next</button>
          </div>
        )}
        </>
      )}
    </div>
  );
}