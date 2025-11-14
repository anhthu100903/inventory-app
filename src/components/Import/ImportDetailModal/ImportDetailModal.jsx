import React from "react";
import styles from "./ImportDetailModal.module.css";
// MdClose không cần thiết vì nó được xử lý bởi Modal cha
// import { MdClose } from "react-icons/md"; 

// Helper: Tách hàm định dạng tiền tệ ra ngoài cho code sạch hơn
const formatCurrency = (amount) => `${(amount || 0).toLocaleString("vi-VN")} ₫`;

export default function ImportDetailModal({ record }) {
    if (!record) return null;

    const totalItems = record.items?.length || 0;
    const formattedDate = record.importDate ? new Date(record.importDate).toLocaleDateString('vi-VN') : "-";

    return (
        <div className={styles.detailContainer}>
            
            {/* THÔNG TIN CHUNG */}
            <div className={styles.infoGroup}>
                <p>
                    <strong>Ngày nhập:</strong> {formattedDate}
                </p>
                <p>
                    <strong>Nhà cung cấp:</strong> {record.supplier?.name || "-"}
                </p>
                <p>
                    <strong>Ghi chú:</strong> {record.note || "-"}
                </p>
            </div>

            <h4 className={styles.productHeader}>
                Sản phẩm đã nhập ({totalItems})
            </h4>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá nhập</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {record.items && totalItems > 0 ? (
                        record.items.map((it, idx) => (
                            <tr key={idx}>
                                {/* QUAN TRỌNG: Thêm data-label cho Responsive Table, và wrap tên trong span nếu cần */}
                                <td data-label="Tên sản phẩm"><span>{it.productName || it.name || "-"}</span></td>
                                <td data-label="Số lượng">{it.quantity || 0}</td>
                                <td data-label="Giá nhập">{formatCurrency(it.importPrice)}</td>
                                <td data-label="Thành tiền" className={styles.subtotalCell}> 
                                    {formatCurrency((it.quantity || 0) * (it.importPrice || 0))}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                                Không có sản phẩm nào được nhập
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className={styles.totalFooter}>
                <strong>Tổng cộng:</strong>
                <span className={styles.totalAmount}>{formatCurrency(record.totalAmount)}</span>
            </div>
        </div>
    );
}