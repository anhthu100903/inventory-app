import React from "react";
import styles from "./InvoiceList.module.css";

export default function InvoiceList({ invoices = [], loading = false, onReload }) {
  return (
    <div className={styles.listContainer}>
      {loading ? (
        <p>Đang tải...</p>
      ) : invoices.length === 0 ? (
        <p>Không có hoá đơn.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Số hoá đơn</th>
              <th>Ngày</th>
              <th>Khách</th>
              <th>Số sản phẩm</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv.id}>
                <td>{i + 1}</td>
                <td>{inv.invoiceNumber || inv.id}</td>
                <td>{inv.date ? new Date(inv.date).toLocaleString() : ""}</td>
                <td>{inv.customer || ""}</td>
                <td>{(inv.items || []).length}</td>
                <td>{(inv.totalAmount || 0).toLocaleString()} ₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
