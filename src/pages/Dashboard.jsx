import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { getAllInvoices } from "../services/saleService";
import { getAllProducts } from "../services/productService";
import { getImports } from "../services/importService";
import { formatCurrency, toSafeDate } from "../utils/formatUtils";
import SaleForm from "../components/Sales/SaleForm";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalInvoices: 0,
    inventoryNumber: 0,
    topProducts: [],
    recentInvoices: [],
    lowStockProducts: [],
    totalImportAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Primary load: Get invoices and products (critical for dashboard)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const invoices = await getAllInvoices();
        const products = await getAllProducts();

        // Calculate total revenue (scan all invoices, but fast)
        const totalRevenue = invoices.reduce(
          (sum, inv) => sum + (inv.totalAmount || 0),
          0
        );

        // Calculate inventory number (scan all products, but fast)
        const inventoryNumber = products.reduce((sum, prod) => {
          const stock = Number(prod.totalInStock || 0);
          return sum + stock;
        }, 0);

        // Get top sold products (by quantity) - optimize by only checking recent invoices
        const productSalesMap = {};
        invoices.slice(0, 100).forEach((inv) => {
          (inv.items || []).forEach((item) => {
            const key = item.productName || item.name || "Unknown";
            productSalesMap[key] =
              (productSalesMap[key] || 0) + (Number(item.quantity) || 0);
          });
        });
        const topProducts = Object.entries(productSalesMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => ({ name, quantity: qty }));

        // Get recent invoices (last 5)
        const recentInvoices = invoices.slice(0, 5).map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          createdAt: inv.createdAt,
          customer: inv.customer || "N/A",
          total: inv.totalAmount || 0,
        }));

        // Get low stock products (stock < 10) - only sort this filtered list
        const lowStockProducts = products
          .filter((p) => Number(p.totalInStock || 0) < 10)
          .sort(
            (a, b) => Number(a.totalInStock || 0) - Number(b.totalInStock || 0)
          )
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            name: p.name,
            stock: Number(p.totalInStock || 0),
            sku: p.sku,
          }));

        setStats({
          totalRevenue,
          totalProducts: products.length,
          totalInvoices: invoices.length,
          inventoryNumber,
          topProducts,
          recentInvoices,
          lowStockProducts,
          totalImportAmount: 0, // Will be loaded separately
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Secondary load: Get imports data (deferred, not critical for initial display)
  useEffect(() => {
    const loadImportStats = async () => {
      try {
        const imports = await getImports();
        let totalImportAmount = 0;
        totalImportAmount = (imports || []).reduce((sum, imp) => {
          const itemsSum = (imp.items || []).reduce(
            (s, it) =>
              s + (Number(it.quantity) || 0) * (Number(it.importPrice) || 0),
            0
          );
          return sum + itemsSum;
        }, 0);
        setStats((prev) => ({ ...prev, totalImportAmount }));
      } catch (e) {
        console.warn("Failed to load imports for dashboard", e);
      }
    };

    // Defer imports loading by 500ms to avoid blocking initial render
    const timer = setTimeout(loadImportStats, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateInvoice = async () => {
    try {
      // Handle form submission (e.g., print and reload)
      setShowCreateForm(false);
      // Reload stats to show new invoice
      const invoices = await getAllInvoices();
      const products = await getAllProducts();
      
      // Recalculate stats
      const totalRevenue = invoices.reduce(
        (sum, inv) => sum + (inv.totalAmount || 0),
        0
      );
      const inventoryNumber = products.reduce((sum, prod) => {
        const stock = Number(prod.totalInStock || 0);
        return sum + stock;
      }, 0);
      
      const productSalesMap = {};
      invoices.forEach((inv) => {
        (inv.items || []).forEach((item) => {
          const key = item.productName || item.name || "Unknown";
          productSalesMap[key] =
            (productSalesMap[key] || 0) + (Number(item.quantity) || 0);
        });
      });
      const topProducts = Object.entries(productSalesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, quantity: qty }));

      const recentInvoices = invoices.slice(0, 10).map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        createdAt: inv.createdAt,
        customer: inv.customer,
        total: inv.totalAmount,
      }));

      const lowStockProducts = products
        .filter((p) => (Number(p.totalInStock || 0) <= 10))
        .sort((a, b) => (Number(a.totalInStock) || 0) - (Number(b.totalInStock) || 0))
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.name,
          stock: Number(p.totalInStock || 0),
          sku: p.sku,
        }));

      setStats({
        totalRevenue,
        totalProducts: products.length,
        totalInvoices: invoices.length,
        inventoryNumber,
        topProducts,
        recentInvoices,
        lowStockProducts,
      });
    } catch (err) {
      console.error("Failed to create invoice:", err);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Bảng điều khiển</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: "10px 16px",
            backgroundColor: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          + Tạo hóa đơn mới
        </button>
      </div>

      {/* KPI Cards */}
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
          <div className={styles.kpiLabel}>Tổng tiền nhập</div>
          <div className={styles.kpiValue}>
            {formatCurrency(stats.totalImportAmount || 0)}
          </div>
        </div>
      </div>

      {/* Two column section */}
      <div className={styles.twoColumn}>
        {/* Top Products */}
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
                {stats.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td className={styles.center}>{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.emptyMessage}>Không có dữ liệu</p>
          )}
        </div>

        {/* Low Stock Products */}
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
                {stats.lowStockProducts.map((product) => (
                  <tr key={product.id} className={styles.warning}>
                    <td>{product.name}</td>
                    <td className={styles.center}>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.emptyMessage}>Không có sản phẩm sắp hết</p>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
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
              {stats.recentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>
                      {invoice.createdAt
                        ? (toSafeDate(invoice.createdAt) ? toSafeDate(invoice.createdAt).toLocaleDateString("vi-VN") : "-")
                        : "-"}
                  </td>
                  <td>{invoice.customer}</td>
                  <td className={styles.right}>
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyMessage}>Không có hóa đơn</p>
        )}
      </div>

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


