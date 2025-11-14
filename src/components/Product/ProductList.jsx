import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdMoreVert, MdInfo } from "react-icons/md";
import { createPortal } from "react-dom";
import Modal from "../Modal";
import styles from "./ProductList.module.css";

export default function ProductList({ products = [], onEdit, onDelete }) {
  const [localProducts, setLocalProducts] = useState(products || []);
  const [showDropdownId, setShowDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    setLocalProducts(products || []);
  }, [products]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      if (typeof onDelete === "function") onDelete(id);
    }
  };

  const handleEdit = (product) => {
    if (typeof onEdit === "function") onEdit(product);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
    setShowDropdownId(null);
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    if (btn && btn.getBoundingClientRect) {
      const r = btn.getBoundingClientRect();
      setDropdownPos({
        top: r.bottom + window.scrollY,
        left: r.left + window.scrollX,
        right: window.innerWidth - r.right,
      });
    }
    setShowDropdownId((prev) => (prev === id ? null : id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleDocClick = () => setShowDropdownId(null);
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const handleAction = (action, product) => {
    setShowDropdownId(null);
    switch (action) {
      case "view":
        handleView(product);
        break;
      case "edit":
        handleEdit(product);
        break;
      case "delete":
        handleDelete(product.id);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className={styles.productList}>
        {localProducts.length === 0 ? (
          <p className={styles.noData}>Chưa có sản phẩm nào.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th className={styles.hideOnMobile}>SKU</th>
                  <th className={styles.hideOnMobile}>Phân loại</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th className={styles.hideOnTablet}>Giá nhập TB</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {localProducts.map((product) => {
                  const isShown = showDropdownId === product.id && dropdownPos;
                  let portal = null;

                  if (isShown) {
                    const style = { position: "absolute", top: dropdownPos.top + "px" };
                    const RIGHT_THRESHOLD = 150;
                    if (typeof dropdownPos.right === "number" && dropdownPos.right < RIGHT_THRESHOLD) {
                      style.right = dropdownPos.right + "px";
                    } else {
                      const leftVal = Math.max(8, dropdownPos.left);
                      style.left = leftVal + "px";
                    }

                    portal = createPortal(
                      <div
                        className={styles.dropdown}
                        style={style}
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <button
                          onClick={() => handleAction("view", product)}
                          className={`${styles.dropdownItem} ${styles.viewItem}`}
                        >
                          <MdInfo /> Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleAction("edit", product)}
                          className={`${styles.dropdownItem} ${styles.editItem}`}
                        >
                          <MdEdit /> Sửa
                        </button>
                        <button
                          onClick={() => handleAction("delete", product)}
                          className={`${styles.dropdownItem} ${styles.deleteItem}`}
                        >
                          <MdDelete /> Xóa
                        </button>
                      </div>,
                      document.body
                    );
                  }

                  return (
                    <tr key={product.id}>
                      <td className={styles.nameCell}>{product.name}</td>
                      <td className={styles.hideOnMobile}>{product.sku}</td>
                      <td className={styles.hideOnMobile}>
                        <span className={styles.badge}>{product.category || "N/A"}</span>
                      </td>
                      <td>
                        {Number(product.sellingPrice).toLocaleString("vi-VN")} ₫
                      </td>
                      <td>{product.totalInStock}</td>
                      <td className={styles.hideOnTablet}>
                        {Number(product.averageImportPrice).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className={styles.actionCell}>
                        {/* Desktop buttons */}
                        <button
                          onClick={() => handleView(product)}
                          title="Xem chi tiết"
                          className={`${styles.actionButton} ${styles.viewButton}`}
                        >
                          <MdInfo />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          title="Sửa"
                          className={`${styles.actionButton} ${styles.editButton}`}
                        >
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          title="Xóa"
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          <MdDelete />
                        </button>

                        {/* Mobile More button */}
                        <button
                          onClick={(e) => toggleDropdown(e, product.id)}
                          title="Tùy chọn"
                          className={styles.moreButton}
                        >
                          <MdMoreVert />
                        </button>

                        {portal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chi tiết sản phẩm Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Chi tiết sản phẩm"
      >
        {selectedProduct && (
          <div className={styles.detailModal}>
            {/* Thông tin chính: Tên, Giá bán, Tồn kho */}
            <div className={styles.detailHighlight}>
              <div className={styles.highlightItem}>
                <span className={styles.highlightLabel}>Tên sản phẩm</span>
                <span className={styles.highlightValue}>{selectedProduct.name}</span>
              </div>
              <div className={styles.highlightItem}>
                <span className={styles.highlightLabel}>Giá bán</span>
                <span className={styles.highlightValue}>
                  {Number(selectedProduct.sellingPrice).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className={styles.highlightItem}>
                <span className={styles.highlightLabel}>Tồn kho</span>
                <span className={styles.highlightValue}>{selectedProduct.totalInStock}</span>
              </div>
            </div>

            {/* Thông tin khác */}
            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>Thông tin chi tiết</h4>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SKU:</span>
                <span className={styles.detailValue}>{selectedProduct.sku}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phân loại:</span>
                <span className={styles.detailValue}>{selectedProduct.category || "N/A"}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Đơn vị:</span>
                <span className={styles.detailValue}>{selectedProduct.unit}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nhà cung cấp:</span>
                <span className={styles.detailValue}>{selectedProduct.supplier || "N/A"}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Giá nhập:</span>
                <span className={styles.detailValue}>
                  {Number(selectedProduct.averageImportPrice).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Giá nhập TB:</span>
                <span className={styles.detailValue}>
                  {Number(selectedProduct.averageImportPrice).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Giá nhập cao nhất:</span>
                <span className={styles.detailValue}>
                  {Number(selectedProduct.highestImportPrice || 0).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Lợi nhuận (%):</span>
                <span className={styles.detailValue}>{selectedProduct.profitPercent}%</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Đã bán:</span>
                <span className={styles.detailValue}>{selectedProduct.totalSold}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
