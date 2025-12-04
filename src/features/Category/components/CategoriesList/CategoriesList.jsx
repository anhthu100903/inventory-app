import React, { useState, useEffect, useRef } from "react";
import { MdViewList, MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { createPortal } from "react-dom";
import styles from "./CategoriesList.module.css";

function DropdownMenu({ pos, onAction, category }) {
  if (!pos) return null;
  const style = {
    position: "absolute",
    top: pos.top + "px",
    left: pos.left != null ? pos.left + "px" : undefined,
    right: pos.right != null ? pos.right + "px" : undefined,
  };
  return createPortal(
    <div className={styles.dropdown} style={style} onClick={(e) => e.stopPropagation()}>
      <button className={styles.dropdownItem} onClick={() => onAction("view", category)}><MdViewList /> Xem sản phẩm</button>
      <button className={styles.dropdownItem} onClick={() => onAction("edit", category)}><MdEdit /> Sửa</button>
      <button className={styles.dropdownItem} onClick={() => onAction("delete", category)}><MdDelete /> Xóa</button>
    </div>,
    document.body
  );
}

export default function CategoriesList({ categories = [], onView, onEdit, onDelete }) {
  const [openFor, setOpenFor] = useState(null);
  const [pos, setPos] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      setOpenFor(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const toggle = (e, categoryName) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const right = window.innerWidth - rect.right;
    const left = Math.max(8, rect.left);
    const top = rect.bottom + window.scrollY;
    setPos({ top, left, right });
    setOpenFor((prev) => (prev === categoryName ? null : categoryName));
  };

  const handleAction = (action, category) => {
    setOpenFor(null);
    if (action === "view") return onView?.(category);
    if (action === "edit") return onEdit?.(category);
    if (action === "delete") return onDelete?.(category.name);
  };

  if (!categories || categories.length === 0) {
    return <div className={styles.empty}>Chưa có phân loại nào.</div>;
  }

  return (
    <div className={styles.tableContainer} ref={containerRef}>
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
          {categories.map((cat, idx) => {
            const isOpen = openFor === cat.name;
            return (
              <tr key={cat.name} className={styles.row}>
                <td>{idx + 1}</td>
                <td className={styles.categoryName} onClick={() => onView?.(cat)}>{cat.name}</td>
                <td>{cat.productCount}</td>
                <td>{cat.description || "-"}</td>
                <td className={styles.actionCell}>
                  <button onClick={() => onView?.(cat)} title="Xem" className={styles.actionButton}><MdViewList /></button>
                  <button onClick={() => onEdit?.(cat)} title="Sửa" className={styles.actionButton}><MdEdit /></button>
                  <button onClick={() => onDelete?.(cat.name)} title="Xóa" className={styles.actionButton}><MdDelete /></button>

                  <button onClick={(e) => toggle(e, cat.name)} title="Tùy chọn" className={styles.moreButton}><MdMoreVert /></button>

                  {isOpen && <DropdownMenu pos={pos} onAction={handleAction} category={cat} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
