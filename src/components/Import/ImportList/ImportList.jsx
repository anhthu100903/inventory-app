// components/Import/ImportList.jsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getImports,
  deleteImportRecord,
} from "../../../services/importService";
import { MdDelete, MdInfo, MdEdit, MdMoreVert } from "react-icons/md";
import ImportDetailModal from "../ImportDetailModal/ImportDetailModal";
import Modal from "../../Modal";
import styles from "./ImportList.module.css";

export default function ImportList({ imports: propsImports, onEdit, onDelete }) {
  // If parent passes `imports`, use that; otherwise fetch internally
  const [localImports, setLocalImports] = useState(propsImports || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdownId, setShowDropdownId] = useState(null); // id record hiện dropdown
  const [dropdownPos, setDropdownPos] = useState(null); // { top, left, right }

  const fetchImports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getImports();
      setLocalImports(data || []);
    } catch (err) {
      console.error("Error fetching imports:", err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // If parent provided imports array, use it; otherwise fetch on mount
  useEffect(() => {
    if (Array.isArray(propsImports)) {
      setLocalImports(propsImports);
    } else {
      fetchImports();
    }
  }, [propsImports]);

  const handleDelete = async (id) => {
    // If parent provided onDelete handler, delegate to parent
    if (typeof onDelete === "function") return onDelete(id);

    if (!window.confirm("Bạn có chắc muốn xóa phiếu nhập này?")) return;
    try {
      await deleteImportRecord(id);
      setLocalImports((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (record) => {
    if (typeof onEdit === "function") return onEdit(record.id);
    console.log("Edit record:", record);
    alert("Chức năng sửa sẽ được triển khai sau!");
  };

  const openDetailModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    console.debug("toggleDropdown clicked for id:", id);
    const btn = e.currentTarget;
    if (btn && btn.getBoundingClientRect) {
      const r = btn.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + window.scrollY, right: window.innerWidth - r.right, left: r.left + window.scrollX });
    } else {
      setDropdownPos(null);
    }
    setShowDropdownId((prev) => (prev === id ? null : id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleDocClick = () => setShowDropdownId(null);
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const handleAction = (action, record) => {
    setShowDropdownId(null);
    switch (action) {
      case "view":
        openDetailModal(record);
        break;
      case "edit":
        handleEdit(record);
        break;
      case "delete":
        handleDelete(record.id);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.importList}>
      <h2>Danh sách phiếu nhập</h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p style={{ color: "#b91c1c" }}>Lỗi: {String(error)}</p>
      ) : localImports.length === 0 ? (
        <p>Chưa có phiếu nhập nào.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngày</th>
                <th className={styles.supplierHideOnMobile}>Nhà cung cấp</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th className={styles.hideOnMobile}>Ghi chú</th>
                <th className={styles.actionHeader}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {localImports.map((imp, index) => {
                const isShown = showDropdownId == imp.id && dropdownPos;
                let portal = null;
                if (isShown) {
                  const style = { position: 'absolute', top: dropdownPos.top + 'px' };
                  const RIGHT_THRESHOLD = 180;
                  if (typeof dropdownPos.right === 'number' && dropdownPos.right < RIGHT_THRESHOLD) {
                    style.right = dropdownPos.right + 'px';
                  } else {
                    const leftVal = Math.max(8, dropdownPos.left);
                    style.left = leftVal + 'px';
                  }

                  portal = createPortal(
                    <div className={styles.dropdown} style={style} onClick={(ev) => ev.stopPropagation()}>
                      <button onClick={() => handleAction("view", imp)} className={`${styles.dropdownItem} ${styles.viewItem}`}><MdInfo /> Xem chi tiết</button>
                      <button onClick={() => handleAction("edit", imp)} className={`${styles.dropdownItem} ${styles.editItem}`}><MdEdit /> Sửa</button>
                      <button onClick={() => handleAction("delete", imp)} className={`${styles.dropdownItem} ${styles.deleteItem}`}><MdDelete /> Xóa</button>
                    </div>,
                    document.body
                  );
                }

                return (
                  <tr key={imp.id}>
                    <td>{index + 1}</td>
                    <td>{imp.importDate ? new Date(imp.importDate).toLocaleDateString() : "-"}</td>
                    <td className={styles.supplierHideOnMobile}>{imp.supplier?.name || "-"}</td>
                    <td>{imp.items?.length || 0}</td>
                    <td>{(imp.totalAmount || 0).toLocaleString("vi-VN")} ₫</td>
                    <td className={styles.hideOnMobile}>{imp.note || "-"}</td>
                    <td className={styles.actionCell}>
                      {/* Desktop buttons */}
                      <button onClick={() => openDetailModal(imp)} title="Xem chi tiết" className={`${styles.actionButton} ${styles.viewButton}`}><MdInfo /></button>
                      <button onClick={() => handleEdit(imp)} title="Sửa" className={`${styles.actionButton} ${styles.editButton}`}><MdEdit /></button>
                      <button onClick={() => handleDelete(imp.id)} title="Xóa" className={`${styles.actionButton} ${styles.deleteButton}`}><MdDelete /></button>

                      {/* Mobile More button */}
                      <button onClick={(e) => toggleDropdown(e, imp.id)} title="Tùy chọn" className={styles.moreButton}><MdMoreVert /></button>

                      {portal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Chi tiết Phiếu nhập"
      >
        <ImportDetailModal record={selectedRecord} />
      </Modal>
    </div>
  );
}