// features/Supplier/page/Suppliers.jsx
import React from "react";
import { MdAdd } from "react-icons/md";

import Modal from "@components/Modal";
import SearchInput from "@components/SearchInput/SearchInput";

import SupplierForm from "@features/Supplier/components/SupplierForm/SupplierForm";
import SupplierList from "@features/Supplier/components/SupplierList/SupplierList";

import useSuppliers from "@features/Supplier/hooks/useSupplier";

import styles from "./Suppliers.module.css";

export default function Suppliers() {
  const {
    filteredSuppliers,

    searchTerm,
    setSearchTerm,

    form,
    showForm,
    editingId,

    handleChange,
    handleSubmit,
    resetForm,
    openAdd,
    openEdit,
    handleDelete,
  } = useSuppliers();

  return (
    <div className={styles.suppliersPageContainer}>
      <h1 className={styles.suppliersPageTitle}>📦 Quản lý nhà cung cấp</h1>

      {/* Controls */}
      <div className={styles.suppliersControlsFixed}>
        <SearchInput
          className={styles.suppliersSearchInput}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tìm theo tên nhà cung cấp..."
        />

        <button
          className={styles.suppliersAddIconBtn}
          onClick={openAdd}
        >
          <MdAdd size={24} className={styles.addIcon} />
          <span className={styles.addText}>Thêm Nhà Cung Cấp Mới</span>
        </button>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? "✏️ Cập nhật Nhà Cung Cấp" : "➕ Thêm Nhà Cung Cấp Mới"}
      >
        <SupplierForm
          form={form}
          editingId={editingId}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </Modal>

      <div className={styles.suppliersListContainer}>
        <SupplierList
          suppliers={filteredSuppliers}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
