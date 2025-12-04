import React from "react";
import stylesDetail from "./ImportDetailModal.module.css";

const formatCurrency = (amount) => `${(amount || 0).toLocaleString("vi-VN")} ₫`;

export default function ImportDetailModal({ record }) {
  if (!record) return null;

  const totalItems = record.items?.length || 0;
  const formattedDate = record.importDate
    ? new Date(record.importDate).toLocaleDateString("vi-VN")
    : "-";
  return (
    <div className={stylesDetail.detailContainer}>
      <div className={stylesDetail.infoGroup}>
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

      <h4 className={stylesDetail.productHeader}>
        Sản phẩm đã nhập ({totalItems})
      </h4>

      <table className={stylesDetail.table}>
        <thead>
          <tr>
            <th>Tên sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá nhập</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {totalItems > 0 ? (
            record.items.map((it, idx) => (
              <tr key={idx}>
                <td data-label="Tên sản phẩm">
                  <span>{it.productName || it.name || "-"}</span>
                </td>
                <td data-label="Số lượng">{it.quantity || 0}</td>
                <td data-label="Giá nhập">{formatCurrency(it.importPrice)}</td>
                <td
                  data-label="Thành tiền"
                  className={stylesDetail.subtotalCell}
                >
                  {formatCurrency((it.quantity || 0) * (it.importPrice || 0))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                style={{
                  textAlign: "center",
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                Không có sản phẩm nào được nhập
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={stylesDetail.totalFooter}>
        <strong>Tổng cộng:</strong>
        <span className={stylesDetail.totalAmount}>
          {formatCurrency(record.totalAmount)}
        </span>
      </div>
    </div>
  );
}
