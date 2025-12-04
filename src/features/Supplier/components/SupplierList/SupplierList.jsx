// src/features/Supplier/components/SupplierList/SupplierList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { createPortal } from "react-dom";
import styles from "./SupplierList.module.css";

export default function SupplierList({ suppliers = [], onEdit, onDelete }) {
  const [dropdownId, setDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    const close = () => setDropdownId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const toggleDropdown = useCallback((e, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      right: window.innerWidth - rect.right,
    });
    setDropdownId((prev) => (prev === id ? null : id));
  }, []);

  const actionHandler = useCallback(
    (action, supplier) => {
      setDropdownId(null);
      if (action === "edit") return onEdit?.(supplier);
      if (action === "delete") return onDelete?.(supplier.id);
    },
    [onEdit, onDelete]
  );

  if (!suppliers.length) {
    return <div className={styles.empty}>Chưa có nhà cung cấp nào.</div>;
  }

  const pagedList = suppliers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.supplierList}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th className={styles.hideOnMobile}>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {pagedList.map((s, index) => (
              <SupplierRow
                key={s.id}
                supplier={s}
                index={(page - 1) * ITEMS_PER_PAGE + index + 1}
                dropdownId={dropdownId}
                dropdownPos={dropdownPos}
                toggleDropdown={toggleDropdown}
                actionHandler={actionHandler}
              />
            ))}
          </tbody>
        </table>
      </div>

      {suppliers.length > ITEMS_PER_PAGE && (
        <Pagination
          page={page}
          total={suppliers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          setPage={setPage}
        />
      )}
    </div>
  );
}

/* -------------------------- Supplier Row -------------------------- */
function SupplierRow({
  supplier,
  index,
  dropdownId,
  dropdownPos,
  toggleDropdown,
  actionHandler,
}) {
  const isDropdown = dropdownId === supplier.id && dropdownPos;

  let portal = null;
  if (isDropdown) {
    const style = { position: "absolute", top: dropdownPos.top };
    style.right =
      dropdownPos.right < 150 ? dropdownPos.right : undefined;
    style.left =
      dropdownPos.right < 150 ? undefined : Math.max(8, dropdownPos.left);

    portal = createPortal(
      <div className={styles.dropdown} style={style}>
        <button
          className={`${styles.dropdownItem} ${styles.editItem}`}
          onClick={() => actionHandler("edit", supplier)}
        >
          <MdEdit /> Sửa
        </button>

        <button
          className={`${styles.dropdownItem} ${styles.deleteItem}`}
          onClick={() => actionHandler("delete", supplier)}
        >
          <MdDelete /> Xóa
        </button>
      </div>,
      document.body
    );
  }

  return (
    <tr className={styles.row}>
      <td>{index}</td>
      <td className={styles.supplierName}>{supplier.name}</td>
      <td>{supplier.email || "-"}</td>
      <td>{supplier.phone || "-"}</td>
      <td>{supplier.address || "-"}</td>
      <td className={styles.hideOnMobile}>{supplier.note || "-"}</td>

      <td className={styles.actionCell}>
        <button className={styles.editButton} onClick={() => actionHandler("edit", supplier)}>
          <MdEdit />
        </button>

        <button className={styles.deleteButton} onClick={() => actionHandler("delete", supplier)}>
          <MdDelete />
        </button>

        <button
          className={styles.moreButton}
          onClick={(e) => toggleDropdown(e, supplier.id)}
        >
          <MdMoreVert />
        </button>

        {portal}
      </td>
    </tr>
  );
}

/* ------------------------------ Pagination ------------------------------ */
function Pagination({ page, total, itemsPerPage, setPage }) {
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className={styles.pagination}>
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        Prev
      </button>

      <span>
        Trang {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
