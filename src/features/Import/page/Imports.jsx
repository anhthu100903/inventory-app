// feature/Import/page/Imports.jsx
import React from "react";
import { MdAdd, MdAttachMoney } from "react-icons/md";
import Modal from "@/components/Modal";
import ImportForm from "@features/Import/component/ImportForm/ImportForm";
import ImportList from "@features/Import/component/ImportList/ImportList";
import useImports from "@features/Import/hooks/useImports";
import styles from "./Imports.module.css";

export default function Imports() {
  const {
    filteredImports,
    loading,
    filterMonth,
    filterYear,
    yearError,
    filterDate,
    showModal,
    editingImport,
    setFilterMonth,
    setFilterYear,
    setFilterDate,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    closeModal,
  } = useImports();

  return (
    <div className={styles.importsPageContainer}>
      <h1 className={styles.importsPageTitle}>
        <MdAttachMoney size={28} /> Quản lý Nhập Hàng
      </h1>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {/* Month */}
          <div className={styles.filterItem}>
            <label>Tháng</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Tháng {idx + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className={styles.filterItem}>
            <label>Năm</label>
            <input
              type="number"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              min="2000"
              max="2100"
            />
            {yearError && <span className={styles.error}>{yearError}</span>}
          </div>

          {/* Specific date */}
          <div className={styles.filterItem}>
            <label>Ngày cụ thể</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* Add button */}
        <button
          className={styles.importsAddBtn}
          onClick={handleAdd}
          disabled={loading}
        >
          <MdAdd size={20} />
          <span>Thêm Phiếu Nhập</span>
        </button>
      </div>

      {/* List */}
      <ImportList
        imports={filteredImports}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingImport ? "✏️ Cập nhật Phiếu Nhập" : "➕ Thêm Phiếu Nhập"}
      >
        <ImportForm
          initialData={editingImport}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={loading}
        />
      </Modal>
    </div>
  );
}
