// src/components/Category/CategoriesList.jsx
import React, { useState, useEffect } from "react";
import { MdViewList, MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { createPortal } from "react-dom";
import styles from "./CategoriesList.module.css";

export default function CategoriesList({ categories = [], onView, onEdit, onDelete }) {
  const [showDropdownId, setShowDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);

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

  const handleAction = (action, category) => {
    setShowDropdownId(null);
    switch (action) {
      case "view":
        onView?.(category);
        break;
      case "edit":
        onEdit?.(category);
        break;
      case "delete":
        onDelete?.(category.name);
        break;
      default:
        break;
    }
  };

  if (categories.length === 0) {
    return <div className={styles.empty}>Chưa có phân loại nào.</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên phân loại</th>
            <th>Số sản phẩm</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => {
            const isShown = showDropdownId === category.name && dropdownPos;
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
                    onClick={() => handleAction("view", category)}
                    className={`${styles.dropdownItem} ${styles.viewItem}`}
                  >
                    <MdViewList /> Xem sản phẩm
                  </button>
                  <button
                    onClick={() => handleAction("edit", category)}
                    className={`${styles.dropdownItem} ${styles.editItem}`}
                  >
                    <MdEdit /> Sửa
                  </button>
                  <button
                    onClick={() => handleAction("delete", category)}
                    className={`${styles.dropdownItem} ${styles.deleteItem}`}
                  >
                    <MdDelete /> Xóa
                  </button>
                </div>,
                document.body
              );
            }

            return (
              <tr key={category.name} className={styles.row}>
                <td>{index + 1}</td>
                <td 
                  className={styles.categoryName}
                  onClick={() => handleAction("view", category)}
                >
                  {category.name}
                </td>
                <td>{category.productCount}</td>
                <td>{category.description || "-"}</td>
                <td className={styles.actionCell}>
                  {/* Desktop buttons */}
                  <button
                    onClick={() => handleAction("view", category)}
                    title="Xem sản phẩm"
                    className={`${styles.actionButton} ${styles.viewButton}`}
                  >
                    <MdViewList />
                  </button>
                  <button
                    onClick={() => handleAction("edit", category)}
                    title="Sửa"
                    className={`${styles.actionButton} ${styles.editButton}`}
                  >
                    <MdEdit />
                  </button>
                  <button
                    onClick={() => handleAction("delete", category)}
                    title="Xóa"
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    <MdDelete />
                  </button>

                  {/* Mobile More button */}
                  <button
                    onClick={(e) => toggleDropdown(e, category.name)}
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
  );
}