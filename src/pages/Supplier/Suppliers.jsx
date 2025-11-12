import React, { useEffect, useState, useCallback, useMemo } from "react";
import { MdAdd } from "react-icons/md";
import SupplierForm from "../../components/Supplier/SupplierForm";
import SupplierList from "../../components/Supplier/SupplierList";
import Modal from "../../components/Modal";
import SearchInput from "../../components/SearchInput/SearchInput";
import { Supplier } from "../../models/Supplier";
import {
  getAllSuppliers,
  addSupplier,
  deleteSupplier,
  updateSupplier,
} from "../../services/supplierService";
import styles from "./Suppliers.module.css";

// Khởi tạo state form ban đầu bằng một instance của Supplier Model
const initialFormState = new Supplier({});

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  // ====================================================
  // Tải dữ liệu (Memoization - Giữ ổn định)
  // ====================================================
  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
      setFilteredSuppliers(data); // Khởi tạo filteredSuppliers ban đầu
    } catch (error) {
      console.error("Lỗi khi tải nhà cung cấp:", error);
      // Xử lý lỗi UI (ví dụ: hiển thị thông báo lỗi)
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // 🚨 Logic lọc theo tên
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSuppliers(suppliers);
    } else {
      setFilteredSuppliers(
        suppliers.filter((supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, suppliers]); // Chạy lại khi searchTerm hoặc suppliers thay đổi

  // ====================================================
  // Xử lý Form và State
  // ====================================================

  // Hàm reset và ẩn Form (Được bảo vệ bằng useCallback)
  const resetAndHideForm = useCallback(() => {
    setEditingId(null);
    setForm(initialFormState);
    setIsFormVisible(false);
    loadSuppliers();
  }, [loadSuppliers]);

  // Xử lý thay đổi trường input (Được bảo vệ bằng useCallback)
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Sử dụng cú pháp spread để đảm bảo form là một đối tượng mới hoàn toàn (tính bất biến)
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Xử lý Submit (Thêm/Sửa) - Được bảo vệ bằng useCallback
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!form.name || !form.name.trim()) {
        return alert("Tên không được để trống!");
      }

      try {
        if (editingId) {
          await updateSupplier(editingId, form);
          alert("✅ Cập nhật thành công!");
        } else {
          await addSupplier(form);
          alert("✅ Thêm thành công!");
        }
        resetAndHideForm();
      } catch (error) {
        console.error("Lỗi xử lý form:", error);
        alert("❌ Đã xảy ra lỗi khi lưu dữ liệu.");
      }
    },
    [form, editingId, resetAndHideForm]
  );

  // ====================================================
  // Hành động (Actions)
  // ====================================================

  // Xử lý khi nhấn nút Thêm mới (Được bảo vệ bằng useCallback)
  const handleAddClick = useCallback(() => {
    setEditingId(null);
    setForm(initialFormState);
    setIsFormVisible(true);
  }, []);

  // Xử lý khi nhấn nút Xóa (Được bảo vệ bằng useCallback)
  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Bạn có chắc muốn xóa nhà cung cấp này không?")) {
        try {
          await deleteSupplier(id);
          loadSuppliers();
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
        }
      }
    },
    [loadSuppliers]
  );

  // Xử lý khi nhấn nút Sửa (Được bảo vệ bằng useCallback)
  const handleEdit = useCallback((supplier) => {
    setEditingId(supplier.id);
    setForm(supplier);
    setIsFormVisible(true);
  }, []);

  // Xử lý khi nhấn nút Hủy trong Form (Sử dụng hàm chung)
  const handleCancel = useCallback(() => {
    resetAndHideForm();
  }, [resetAndHideForm]);

  // Kiểm soát việc hiển thị Form (Sử dụng useMemo)
  const showForm = useMemo(
    () => isFormVisible || editingId,
    [isFormVisible, editingId]
  );

  // ====================================================
  // 4. Render UI
  // ====================================================
  return (
    <div className={styles.suppliersPageContainer}>
      <h1 className={styles.suppliersPageTitle}>📦 Quản lý nhà cung cấp</h1>

      {/* 🚨 Vùng điều khiển cố định: Nút Thêm & Thanh tìm kiếm */}
      <div className={styles.suppliersControlsFixed}>
        <SearchInput
          className={styles.suppliersSearchInput} // Thêm class specific để style rộng hơn
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tìm theo tên nhà cung cấp..."
        />
        <button
          className={styles.suppliersAddIconBtn}
          onClick={handleAddClick}
          aria-label="Thêm Nhà Cung Cấp Mới"
        >
          {/* Icon: Hiển thị trên mobile */}
          <MdAdd
            size={24}
            className={styles.addIcon} // Class mới để style riêng
          />

          {/* Text: Hiển thị trên desktop */}
          <span className={styles.addText}>Thêm Nhà Cung Cấp Mới</span>
        </button>
      </div>

      {/* 🚨 MODAL CHỨA FORM */}
      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={
          editingId ? "✏️ Cập nhật Nhà Cung Cấp" : "➕ Thêm Nhà Cung Cấp Mới"
        }
      >
        <SupplierForm
          form={form}
          editingId={editingId}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      {/* Wrap SupplierList để full width */}
      <div className={styles.suppliersListContainer}>
        <SupplierList
          suppliers={filteredSuppliers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Suppliers;
