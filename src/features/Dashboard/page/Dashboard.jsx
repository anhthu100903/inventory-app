import React from "react";
import styles from "./Dashboard.module.css";
import SaleForm from "@features/Sales/components/SaleForm/SaleForm";
import useDashboard from "@features/Dashboard/hooks/useDashboard";
import { formatCurrency, toSafeDate } from "@shared/utils/formatUtils";

export default function Dashboard() {
  const {
    stats,
    loading,
    showCreateForm,
    setShowCreateForm,
    handleCreateInvoice,
    handleCancelCreate
  } = useDashboard();

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerRow}>
        <h1>Bảng điều khiển</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className={styles.createBtn}
        >
          + Tạo hóa đơn mới
        </button>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Tổng sản phẩm</div>
          <div className={styles.kpiValue}>{stats.totalProducts}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Tổng hóa đơn</div>
          <div className={styles.kpiValue}>{stats.totalInvoices}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Số sản phẩm tồn kho</div>
          <div className={styles.kpiValue}>
            {formatCurrency(stats.inventoryNumber)}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Tổng doanh thu</div>
          <div className={styles.kpiValue}>
            {formatCurrency(stats.totalRevenue)}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Doanh thu tuần này</div>
          <div className={styles.kpiValue}>{formatCurrency(stats.weeklyRevenue)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Doanh thu tháng này</div>
          <div className={styles.kpiValue}>{formatCurrency(stats.monthlyRevenue)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Doanh thu năm nay</div>
          <div className={styles.kpiValue}>{formatCurrency(stats.yearlyRevenue)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Tổng tiền nhập</div>
          <div className={styles.kpiValue}>
            {formatCurrency(stats.totalImportAmount)}
          </div>
        </div>
      </div>

      {/* 2 Columns */}
      <div className={styles.twoColumn}>
        {/* TOP PRODUCTS */}
        <div className={styles.section}>
          <h2>Sản phẩm bán chạy</h2>
          {stats.topProducts.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng bán</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td className={styles.center}>{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.emptyMessage}>Không có dữ liệu</p>
          )}
        </div>

        {/* LOW STOCK */}
        <div className={styles.section}>
          <h2>Sản phẩm sắp hết hàng</h2>
          {stats.lowStockProducts.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map((p) => (
                  <tr key={p.id} className={styles.warning}>
                    <td>{p.name}</td>
                    <td className={styles.center}>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.emptyMessage}>Không có sản phẩm sắp hết</p>
          )}
        </div>
      </div>

      {/* RECENT INVOICES */}
      <div className={styles.section}>
        <h2>Hóa đơn gần đây</h2>
        {stats.recentInvoices.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Ngày</th>
                <th>Khách hàng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>
                    {inv.createdAt
                      ? toSafeDate(inv.createdAt)?.toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>{inv.customer}</td>
                  <td className={styles.right}>
                    {formatCurrency(inv.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyMessage}>Không có hóa đơn</p>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}

      {/* Create Invoice Modal */}
      {showCreateForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateForm(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "20px" }}>Tạo hóa đơn mới</h2>
            <SaleForm
              initialData={null}
              onSubmit={handleCreateInvoice}
              onCancel={handleCancelCreate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
