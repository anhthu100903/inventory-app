import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getImports,
  addImportRecord,
  deleteImportRecord,
  updateImportRecord,
} from "../../services/importService";
import { MdAdd, MdEdit, MdDelete, MdAttachMoney } from "react-icons/md";
import { format } from "date-fns";
import Modal from "../../components/Modal";
import ImportForm from "../../components/Import/ImportForm/ImportForm";
import styles from "./Imports.module.css";
import ImportList from "../../components/Import/ImportList/ImportList";

const getDateValue = (dateValue) => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  if (dateValue.toDate && typeof dateValue.toDate === "function")
    return dateValue.toDate();
  return null;
};

export default function Imports() {
  const [imports, setImports] = useState([]);
  const [filteredImports, setFilteredImports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterMonth, setFilterMonth] = useState("");
  const [loading, setLoading] = useState(false);

  // ====================================================
  // 1. Tải dữ liệu và Logic Lọc (useCallback, useMemo)
  // ====================================================

  const fetchImports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getImports();
      setImports(data);
    } catch (error) {
      console.error("Error fetching imports:", error);
      alert("Lỗi khi tải phiếu nhập: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  // Logic Lọc (Đã tối ưu hóa)
  useEffect(() => {
    let filtered = imports;

    if (filterMonth) {
      filtered = filtered.filter((imp) => {
        const date = getDateValue(imp.createdAt);
        return date && format(date, "yyyy-MM") === filterMonth;
      });
    }
    setFilteredImports(filtered);
  }, [filterMonth, imports]);

  // ====================================================
  // 2. Logic Xử lý Modal & Actions
  // ====================================================

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingId(null);
    // Không cần loadImports ở đây, chỉ cần khi submit/delete
  }, []);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((id) => {
    setEditingId(id);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Xóa phiếu nhập này? Dữ liệu không thể khôi phục."))
        return;
      setLoading(true);
      try {
        await deleteImportRecord(id);
        fetchImports(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        alert("Lỗi khi xóa: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchImports]
  );

  // 🚨 Logic xử lý Submit (Tinh gọn và Dựa vào Service)
  const handleFormSubmit = useCallback(
    async (data) => {
      setLoading(true);
      try {
        if (editingId) {
          await updateImportRecord(editingId, data);
          alert("✅ Cập nhật thành công!");
        } else {
          await addImportRecord(data);
          alert("✅ Thêm thành công!");
        }

        // 🚨 FIX LỖI: Chờ fetchImports hoàn thành
        await fetchImports();

        handleCloseModal();
      } catch (error) {
        console.error("Lỗi khi lưu phiếu nhập:", error);
        alert("❌ Đã xảy ra lỗi khi lưu dữ liệu: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [editingId, fetchImports, handleCloseModal]
  );

  // 🚨 Chuẩn hóa dữ liệu ban đầu cho Form Edit (Sử dụng useMemo)
  const initialImport = useMemo(() => {
    if (!editingId) return null;
    // Tìm và trả về đối tượng Import (đã là Model)
    return imports.find((imp) => imp.id === editingId) || null;
  }, [editingId, imports]);

  // ====================================================
  // 3. Render UI
  // ====================================================
  return (
    <div className={styles.importsPageContainer}>
      <h1 className={styles.importsPageTitle}>
        <MdAttachMoney size={28} /> Quản lý Nhập Hàng
      </h1>

      {/* Controls: Filters + Add Button */}
      <div className={styles.importsControls}>
        {/* ... (Phần Filter giữ nguyên) ... */}
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <label htmlFor="filter-month" className={styles.filterLabel}>
              Tháng/Năm
            </label>
            <input
              id="filter-month"
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className={styles.filterInput}
            />
          </div>
        </div>

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
        onClose={handleCloseModal}
        title={editingId ? "✏️ Cập nhật Phiếu Nhập" : "➕ Thêm Phiếu Nhập Mới"}
      >
        <ImportForm
          initialData={initialImport} // Dữ liệu đã chuẩn hóa (Model)
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          loading={loading}
        />
      </Modal>
    </div>
  );
}
