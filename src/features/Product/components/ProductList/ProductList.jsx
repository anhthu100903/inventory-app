// inventory-app/src/components/Product/ProductList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { MdEdit, MdDelete, MdMoreVert, MdInfo } from "react-icons/md";
import { createPortal } from "react-dom";
import Modal from "@components/Modal";
import styles from "./ProductList.module.css";

const ITEMS_PER_PAGE = 50;

export default function ProductList({ products = [], onEdit, onDelete }) {
  const [localProducts, setLocalProducts] = useState(products);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdown, setDropdown] = useState({ id: null, pos: null });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Cập nhật danh sách sản phẩm khi prop thay đổi
  useEffect(() => {
    setLocalProducts(products);
    setCurrentPage(1);
  }, [products]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = () => setDropdown({ id: null, pos: null });
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAction = useCallback(
    (action, product) => {
      setDropdown({ id: null, pos: null });
      if (!product) return;

      switch (action) {
        case "view":
          setSelectedProduct(product);
          setIsDetailOpen(true);
          break;
        case "edit":
          onEdit?.(product);
          break;
        case "delete":
          if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            onDelete?.(product.id);
          }
          break;
        default:
          break;
      }
    },
    [onEdit, onDelete]
  );

  const toggleDropdown = (e, productId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdown((prev) => ({
      id: prev.id === productId ? null : productId,
      pos: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, right: window.innerWidth - rect.right },
    }));
  };

  const paginatedProducts = localProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(localProducts.length / ITEMS_PER_PAGE);

  return (
    <>
      <div className={styles.productList}>
        {!localProducts.length ? (
          <p className={styles.noData}>Chưa có sản phẩm nào.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>STT</th>
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
                {paginatedProducts.map((product, index) => {
                  const isDropdownOpen = dropdown.id === product.id && dropdown.pos;
                  let portal = null;

                  if (isDropdownOpen) {
                    const style = { position: "absolute", top: dropdown.pos.top + "px" };
                    style.right = dropdown.pos.right < 150 ? dropdown.pos.right + "px" : undefined;
                    style.left = style.right ? undefined : Math.max(8, dropdown.pos.left) + "px";

                    portal = createPortal(
                      <div className={styles.dropdown} style={style} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleAction("view", product)} className={`${styles.dropdownItem} ${styles.viewItem}`}>
                          <MdInfo /> Xem chi tiết
                        </button>
                        <button onClick={() => handleAction("edit", product)} className={`${styles.dropdownItem} ${styles.editItem}`}>
                          <MdEdit /> Sửa
                        </button>
                        <button onClick={() => handleAction("delete", product)} className={`${styles.dropdownItem} ${styles.deleteItem}`}>
                          <MdDelete /> Xóa
                        </button>
                      </div>,
                      document.body
                    );
                  }

                  return (
                    <tr key={product.id}>
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td className={styles.nameCell}>{product.name}</td>
                      <td className={styles.hideOnMobile}>{product.sku}</td>
                      <td className={styles.hideOnMobile}><span className={styles.badge}>{product.category || "N/A"}</span></td>
                      <td>{Number(product.sellingPrice).toLocaleString("vi-VN")} ₫</td>
                      <td>{product.totalInStock}</td>
                      <td className={styles.hideOnTablet}>{Number(product.averageImportPrice).toLocaleString("vi-VN")} ₫</td>
                      <td className={styles.actionCell}>
                        {/* Desktop / Tablet buttons */}
                        <button onClick={() => handleAction("view", product)} title="Xem chi tiết" className={`${styles.actionButton} ${styles.viewButton} ${styles.hideOnMobile}`}><MdInfo /></button>
                        <button onClick={() => handleAction("edit", product)} title="Sửa" className={`${styles.actionButton} ${styles.editButton} ${styles.hideOnMobile}`}><MdEdit /></button>
                        <button onClick={() => handleAction("delete", product)} title="Xóa" className={`${styles.actionButton} ${styles.deleteButton} ${styles.hideOnMobile}`}><MdDelete /></button>
                        {/* Mobile More button */}
                        <button onClick={(e) => toggleDropdown(e, product.id)} title="Tùy chọn" className={styles.moreButton}><MdMoreVert /></button>
                        {portal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {localProducts.length > ITEMS_PER_PAGE && (
          <div className={styles.pagination}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</button>
            <span>Trang {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Chi tiết sản phẩm">
        {selectedProduct && (
          <div className={styles.detailModal}>
            <div className={styles.detailHighlight}>
              {["Tên sản phẩm", "Giá bán", "Tồn kho"].map((label, i) => {
                const value = label === "Tên sản phẩm" ? selectedProduct.name
                  : label === "Giá bán" ? Number(selectedProduct.sellingPrice).toLocaleString("vi-VN") + " ₫"
                  : selectedProduct.totalInStock;
                return (
                  <div className={styles.highlightItem} key={i}>
                    <span className={styles.highlightLabel}>{label}</span>
                    <span className={styles.highlightValue}>{value}</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>Thông tin chi tiết</h4>
              {[
                ["SKU", selectedProduct.sku],
                ["Phân loại", selectedProduct.category || "N/A"],
                ["Đơn vị", selectedProduct.unit || "N/A"],
                ["Nhà cung cấp", selectedProduct.supplier || "N/A"],
                ["Giá nhập TB", Number(selectedProduct.averageImportPrice).toLocaleString("vi-VN") + " ₫"],
                ["Giá nhập cao nhất", Number(selectedProduct.highestImportPrice || 0).toLocaleString("vi-VN") + " ₫"],
                ["Lợi nhuận (%)", selectedProduct.profitPercent || "N/A"],
                ["Đã bán", selectedProduct.totalSold || 0],
                ["Thời gian tạo", selectedProduct.createdAt ? (typeof selectedProduct.createdAt.toDate === 'function' ? selectedProduct.createdAt.toDate().toLocaleString() : new Date(selectedProduct.createdAt).toLocaleString()) : '-'],
                ["Cập nhật lần cuối", selectedProduct.updatedAt ? (typeof selectedProduct.updatedAt.toDate === 'function' ? selectedProduct.updatedAt.toDate().toLocaleString() : new Date(selectedProduct.updatedAt).toLocaleString()) : '-']
              ].map(([label, value]) => (
                <div className={styles.detailRow} key={label}>
                  <span className={styles.detailLabel}>{label}:</span>
                  <span className={styles.detailValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
