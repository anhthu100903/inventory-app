// components/Import/SupplierSelect.jsx
import React, { useState, useEffect } from "react";
import { MdSearch, MdClose, MdBusiness, MdArrowDropDown, MdArrowDropUp, MdAdd } from "react-icons/md";
import { getAllSuppliers } from "../../../services/supplierService"; // import từ service
import styles from "./SupplierSelect.module.css";

export default function SupplierSelect({ onSelect, error, className = "", onOpenSupplierModal, value = null, reloadKey = 0 }) {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const data = await getAllSuppliers(); // lấy từ service
        setSuppliers(data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, [reloadKey]);

  useEffect(() => {
    // If a selected value is provided from parent, reflect its name in the input
    if (value && value.name) {
      setSearch(value.name);
      setFiltered([]);
      return;
    }

    if (search.trim() === "") {
      if (isOpen) {
        setFiltered(suppliers.slice(0, 10)); // Hiển thị 10 nhà cung cấp đầu
      } else {
        setFiltered([]);
      }
      return;
    }

    const result = suppliers.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, suppliers, isOpen, value]);

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

  const handleOpenAddModal = (suggestedName = "") => {
    setIsOpen(false);
    onOpenSupplierModal(suggestedName);
  };

  return (
    <div className={`${styles.supplierContainer} ${className} ${error ? styles.error : ""}`}>
      <div className={styles.combinedInput}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${styles.supplierInput} ${isOpen ? styles.open : ""}`}
          placeholder="Chọn nhà cung cấp..."
          readOnly={true}
          onClick={toggleDropdown}
        />
        <button type="button" onClick={toggleDropdown} className={styles.selectBtn}>
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
