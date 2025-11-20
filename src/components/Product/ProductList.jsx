import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdMoreVert, MdInfo } from "react-icons/md";
import { createPortal } from "react-dom";
import Modal from "../Modal"; // Giả định đường dẫn đến Modal component
import styles from "./ProductList.module.css"; // CSS Modules

export default function ProductList({ products = [], onEdit, onDelete }) {
  // State quản lý dữ liệu và UI
  const [localProducts, setLocalProducts] = useState(products || []);
  const [showDropdownId, setShowDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Hằng số phân trang
  const ITEMS_PER_PAGE = 50;

  // Cập nhật danh sách sản phẩm khi prop thay đổi và reset trang
  useEffect(() => {
    setLocalProducts(products || []);
    setCurrentPage(1);
  }, [products]);

  // Xử lý sự kiện xóa sản phẩm
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      if (typeof onDelete === "function") onDelete(id);
    }
  };

  // Xử lý sự kiện chỉnh sửa sản phẩm
  const handleEdit = (product) => {
    if (typeof onEdit === "function") onEdit(product);
  };

  // Xử lý sự kiện xem chi tiết sản phẩm
  const handleView = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
    setShowDropdownId(null); // Đóng dropdown nếu đang mở
  };

  // Bật/Tắt dropdown (cho mobile) và tính toán vị trí hiển thị
  const toggleDropdown = (e, id) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra document
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

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleDocClick = () => setShowDropdownId(null);
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  // Xử lý hành động từ dropdown
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

  // Tính toán tổng số trang
  const totalPages = Math.ceil(localProducts.length / ITEMS_PER_PAGE);
  
  return (
    <>
      <div className={styles.productList}>
        {/* Trường hợp không có dữ liệu */}
        {localProducts.length === 0 ? (
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
                {/* Lấy dữ liệu theo phân trang */}
                {localProducts
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((product, index) => {
                    const isShown = showDropdownId === product.id && dropdownPos;
                    let portal = null;

                    // Logic hiển thị Dropdown (sử dụng Portal)
                    if (isShown) {
                      const style = { position: "absolute", top: dropdownPos.top + "px" };
                      const RIGHT_THRESHOLD = 150; 
                      
                      // Điều chỉnh vị trí dropdown nếu nó quá sát mép phải
                      if (typeof dropdownPos.right === "number" && dropdownPos.right < RIGHT_THRESHOLD) {
                        // Đặt cách mép phải một khoảng
                        style.right = dropdownPos.right + "px"; 
                      } else {
                        // Mặc định đặt từ mép trái
                        const leftVal = Math.max(8, dropdownPos.left);
                        style.left = leftVal + "px";
                      }

                      portal = createPortal(
                        <div
                          className={styles.dropdown}
                          style={style}
                          onClick={(ev) => ev.stopPropagation()} // Ngăn click bên trong đóng dropdown
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
                        document.body // Render ra ngoài root DOM node
                      );
                    }

                    return (
                      <tr key={product.id}>
                        <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
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
                          {/* Desktop/Tablet buttons (luôn hiển thị) */}
                          <button
                            onClick={() => handleView(product)}
                            title="Xem chi tiết"
                            className={`${styles.actionButton} ${styles.viewButton} ${styles.hideOnMobile}`}
                          >
                            <MdInfo />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            title="Sửa"
                            className={`${styles.actionButton} ${styles.editButton} ${styles.hideOnMobile}`}
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            title="Xóa"
                            className={`${styles.actionButton} ${styles.deleteButton} ${styles.hideOnMobile}`}
                          >
                            <MdDelete />
                          </button>

                          {/* Mobile More button (chỉ hiển thị trên mobile) */}
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

        {/* Phân trang (Pagination) */}
        {localProducts.length > ITEMS_PER_PAGE && (
          <div className={styles.pagination}>
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>Trang {currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
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
                <span className={styles.detailValue}>{selectedProduct.unit || "N/A"}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nhà cung cấp:</span>
                <span className={styles.detailValue}>{selectedProduct.supplier || "N/A"}</span>
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
                <span className={styles.detailValue}>{selectedProduct.profitPercent || "N/A"}%</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Đã bán:</span>
                <span className={styles.detailValue}>{selectedProduct.totalSold || 0}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Thời gian tạo:</span>
                <span className={styles.detailValue}>
                  {selectedProduct.createdAt ? (typeof selectedProduct.createdAt.toDate === 'function' ? selectedProduct.createdAt.toDate().toLocaleString() : new Date(selectedProduct.createdAt).toLocaleString()) : '-'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Cập nhật lần cuối:</span>
                <span className={styles.detailValue}>
                  {selectedProduct.updatedAt ? (typeof selectedProduct.updatedAt.toDate === 'function' ? selectedProduct.updatedAt.toDate().toLocaleString() : new Date(selectedProduct.updatedAt).toLocaleString()) : '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}