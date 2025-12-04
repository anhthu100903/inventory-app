import React, { useState, useEffect, useCallback } from "react";
import { MdSearch, MdClose, MdBusiness, MdArrowDropDown, MdArrowDropUp, MdAdd } from "react-icons/md";
import { getAllSuppliers } from "@services/supplierService"; // import từ service
import styles from "./SupplierSelect.module.css";

export default function SupplierSelect({
  onSelect,
  error,
  className = "",
  onOpenSupplierModal,
  value = null,
  reloadKey = 0,
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load suppliers (reloadKey triggers reload)
  useEffect(() => {
    let mounted = true;
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const data = await getAllSuppliers();
        if (!mounted) return;
        setSuppliers(data || []);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSuppliers();
    return () => { mounted = false; };
  }, [reloadKey]);

  // Keep displayed search text in sync with parent-provided value
  useEffect(() => {
    if (value && value.name) {
      setSearch(value.name);
      setFiltered([]);
      return;
    }
    // if no explicit value, clear search (but don't clear when dropdown open)
    if (!isOpen) setFiltered([]);
  }, [value, isOpen]);

  // Filter suppliers when user types or when dropdown opens
  useEffect(() => {
    if (value && value.name && search === value.name) {
      setFiltered([]);
      return;
    }

    if (search.trim() === "") {
      if (isOpen) {
        setFiltered(suppliers.slice(0, 10)); // show top 10 when opened
      } else {
        setFiltered([]);
      }
      return;
    }

    const q = search.toLowerCase();
    const result = suppliers.filter((s) => s.name.toLowerCase().includes(q));
    setFiltered(result);
  }, [search, suppliers, isOpen, value]);

  const handleSelect = useCallback((supplier) => {
    onSelect(supplier);
    setSearch(supplier.name);
    setFiltered([]);
    setIsOpen(false);
  }, [onSelect]);

  const clearSelection = useCallback(() => {
    setSearch("");
    setFiltered([]);
    onSelect(null);
  }, [onSelect]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next && !search) setFiltered([]);
      if (next && !search) setFiltered(suppliers.slice(0, 10));
      return next;
    });
  }, [search, suppliers]);

  const handleOpenAddModal = useCallback((suggestedName = "") => {
    setIsOpen(false);
    onOpenSupplierModal(suggestedName);
  }, [onOpenSupplierModal]);

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
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        />
        <button type="button" onClick={toggleDropdown} className={styles.selectBtn} aria-label="Mở danh sách nhà cung cấp">
          {isOpen ? <MdArrowDropUp size={18} /> : <MdArrowDropDown size={18} />}
        </button>
        {search && (
          <button type="button" onClick={clearSelection} className={styles.clearBtn} title="Xóa lựa chọn" aria-label="Xóa lựa chọn">
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
              aria-label="Tìm nhà cung cấp"
            />
          </div>

          {loading ? (
            <div className={styles.loadingMsg}>
              <div className={styles.spinner}></div>
              <span>Đang tải danh sách...</span>
            </div>
          ) : filtered.length > 0 ? (
            <ul className={styles.dropdown} role="listbox" aria-label="Danh sách nhà cung cấp">
              {filtered.map((s) => (
                <li key={s.id} className={styles.dropdownItem} onClick={() => handleSelect(s)} role="option" aria-selected={value?.id === s.id}>
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
