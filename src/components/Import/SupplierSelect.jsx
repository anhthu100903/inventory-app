// components/Import/SupplierSelect.jsx
import React, { useState, useEffect } from "react";
import { MdSearch, MdClose, MdBusiness, MdArrowDropDown, MdArrowDropUp, MdAdd } from "react-icons/md";
import { collection, getDocs } from "firebase/firestore"; // Bỏ addDoc, vì add qua modal
import { db } from "../../firebaseConfig";
import styles from "./SupplierSelect.module.css";

export default function SupplierSelect({ onSelect, error, className = "", onOpenSupplierModal }) {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "suppliers"));
        const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered([]);
      return;
    }
    const result = suppliers.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, suppliers]);

  const handleSelect = (supplier) => {
    onSelect(supplier);
    setSearch(supplier.name);
    setFiltered([]);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSearch("");
    setFiltered([]);
    onSelect(null);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !search) setFiltered(suppliers.slice(0, 10));
  };

  // 👈 Khi không tìm thấy, mở modal form thay vì add trực tiếp
  const handleOpenAddModal = (suggestedName = "") => {
    setIsOpen(false); // Đóng dropdown
    onOpenSupplierModal(suggestedName); // Gọi prop từ parent
  };

  return (
    <div className={`${styles.supplierContainer} ${className} ${error ? styles.error : ""}`}>
      <div className={styles.combinedInput}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${styles.supplierInput} ${isOpen ? styles.open : ""}`}
          placeholder="Chọn nhà cung cấp..."
          disabled={loading}
          readOnly={true}
          onClick={toggleDropdown}
        />
        <button type="button" onClick={toggleDropdown} className={styles.selectBtn} disabled={loading}>
          {isOpen ? <MdArrowDropUp size={18} /> : <MdArrowDropDown size={18} />}
        </button>
        {search && (
          <button type="button" onClick={clearSelection} className={styles.clearBtn} title="Xóa lựa chọn">
            <MdClose size={16} />
          </button>
        )}
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
      {isOpen && (
        <div className={styles.searchForm}>
          <div className={styles.searchWrapper}>
            <MdSearch className={styles.searchIcon} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              placeholder="Tìm nhà cung cấp theo tên..."
              autoFocus
            />
          </div>
          {loading ? (
            <div className={styles.loadingMsg}>
              <div className={styles.spinner}></div>
              <span>Đang tải danh sách...</span>
            </div>
          ) : filtered.length > 0 ? (
            <ul className={styles.dropdown}>
              {filtered.map((s) => (
                <li key={s.id} className={styles.dropdownItem} onClick={() => handleSelect(s)}>
                  <MdBusiness size={16} className={styles.itemIcon} />
                  <div className={styles.itemContent}>
                    <div className={styles.itemName}>{s.name}</div>
                    {s.phone && <div className={styles.itemDetail}>SĐT: {s.phone}</div>}
                  </div>
                </li>
              ))}
            </ul>
          ) : search ? (
            <button onClick={() => handleOpenAddModal(search)} className={`${styles.addNewBtn} ${styles.fadeIn}`}>
              <MdAdd size={20} />
              <span>Thêm nhà cung cấp mới: "{search}"</span>
            </button>
          ) : (
            <div className={styles.noResults}>
              <MdBusiness size={32} className={styles.noIcon} />
              <p>Nhập tên để tìm hoặc thêm nhà cung cấp mới</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}