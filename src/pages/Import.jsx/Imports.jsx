// Imports.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdCalendarToday, MdBusiness, MdNote, MdAttachMoney } from "react-icons/md";
import { format, parseISO } from "date-fns";
import Modal from "../../components/Modal";
import ImportForm from "../../components/Import/ImportForm"; // Giả sử bạn có form riêng
import styles from './Imports.module.css';

export default function Imports() {
  const [imports, setImports] = useState([]);
  const [filteredImports, setFilteredImports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [loading, setLoading] = useState(false); // Thêm loading state

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "imports"), orderBy("importDate", "desc"))
      );
      const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setImports(data);
      setFilteredImports(data);
    } catch (error) {
      console.error("Error fetching imports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic giữ nguyên...

  const handleAdd = () => {
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa phiếu nhập này? Dữ liệu không thể khôi phục.")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "imports", id));
      fetchImports();
    } catch (error) {
      alert("Lỗi khi xóa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const initialImport = editingId ? imports.find((imp) => imp.id === editingId) : null;

  return (
    <div className={styles.importsPageContainer}>
      <h1 className={styles.importsPageTitle}>
        <MdAttachMoney size={28} /> Quản lý Nhập Hàng
      </h1>

      {/* Controls: Filters + Add Button - Modern flex */}
      <div className={styles.importsControls}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <MdCalendarToday className={styles.filterIcon} />
            <label className={styles.filterLabel}>Tháng</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterItem}>
            <MdFilterList className={styles.filterIcon} />
            <label className={styles.filterLabel}>Năm</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className={styles.filterInput}
            >
              <option value="">Tất cả</option>
              {[...new Set(imports.map((imp) => format(parseISO(imp.importDate), "yyyy")))].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
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

      {/* List: Cards thay table */}
      <div className={styles.importsList}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredImports.length === 0 ? (
          <div className={styles.emptyState}>
            <MdAttachMoney size={64} className={styles.emptyIcon} />
            <h3>Chưa có phiếu nhập nào</h3>
            <p>Bắt đầu bằng cách thêm phiếu nhập đầu tiên của bạn.</p>
            <button onClick={handleAdd} className={styles.emptyAddBtn}>
              <MdAdd size={20} /> Thêm Phiếu Nhập Ngay
            </button>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {filteredImports.map((imp) => (
              <div key={imp.id} className={styles.importCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.dateBadge}>
                    {format(parseISO(imp.importDate), "dd/MM/yyyy")}
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(imp.id)} className={styles.actionBtn}>
                      <MdEdit size={16} title="Chỉnh sửa" />
                    </button>
                    <button onClick={() => handleDelete(imp.id)} className={styles.actionBtn}>
                      <MdDelete size={16} title="Xóa" />
                    </button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.supplierInfo}>
                    <MdBusiness size={20} />
                    <span>{imp.supplierName || "N/A"}</span>
                  </div>
                  <div className={styles.amountInfo}>
                    <MdAttachMoney size={20} />
                    <strong>{imp.totalAmount?.toLocaleString()}₫</strong>
                  </div>
                  <div className={styles.noteInfo}>
                    <MdNote size={16} />
                    <span>{imp.note || "Không có ghi chú"}</span>
                  </div>
                  <div className={styles.itemsBadge}>
                    {imp.items?.length || 0} sản phẩm
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? "✏️ Cập nhật Phiếu Nhập" : "➕ Thêm Phiếu Nhập Mới"}
      >
        <ImportForm
          initialData={initialImport}
          onSubmit={async (data) => {
            setLoading(true);
            try {
              if (editingId) {
                await updateDoc(doc(db, "imports", editingId), data);
              } else {
                await addDoc(collection(db, "imports"), { ...data, importDate: new Date() });
              }
              fetchImports();
              handleCloseModal();
            } catch (error) {
              alert("Lỗi: " + error.message);
            } finally {
              setLoading(false);
            }
          }}
          onCancel={handleCloseModal}
          loading={loading}
        />
      </Modal>
    </div>
  );
}