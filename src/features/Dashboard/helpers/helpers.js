// helpers.js

export const calculateTotalRevenue = (invoices) =>
  invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

export const calculateInventoryNumber = (products) =>
  products.reduce((sum, prod) => sum + Number(prod.totalInStock || 0), 0);

// Top sold products
export const getTopProducts = (invoices, limit = 5) => {
  const map = {};

  invoices.slice(0, 100).forEach((inv) => {
    (inv.items || []).forEach((item) => {
      const name = item.productName || item.name || "Unknown";
      map[name] = (map[name] || 0) + (Number(item.quantity) || 0);
    });
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, quantity]) => ({ name, quantity }));
};

// Low stock (<10)
export const getLowStockProducts = (products, limit = 5) =>
  products
    .filter((p) => Number(p.totalInStock || 0) < 10)
    .sort(
      (a, b) =>
        Number(a.totalInStock || 0) - Number(b.totalInStock || 0)
    )
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      stock: Number(p.totalInStock || 0),
      sku: p.sku,
    }));

// Recent invoices
export const getRecentInvoices = (invoices, limit = 5) =>
  invoices.slice(0, limit).map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    createdAt: inv.createdAt,
    customer: inv.customer || "N/A",
    total: inv.totalAmount || 0,
  }));

// Total import amount
export const calculateTotalImportAmount = (imports) =>
  (imports || []).reduce((sum, imp) => {
    const itemsSum = (imp.items || []).reduce(
      (s, it) =>
        s + (Number(it.quantity) || 0) * (Number(it.importPrice) || 0),
      0
    );
    return sum + itemsSum;
  }, 0);

// Helpers: Revenue for current week/month/year
import { toDateOrNull } from "../../../shared/utils/dateUtils";

const startOfWeek = (d) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
};

const startOfMonth = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  return date;
};

const startOfYear = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setMonth(0, 1);
  date.setDate(1);
  return date;
};

const sumInvoicesBetween = (invoices, from, to) =>
  (invoices || []).reduce((sum, inv) => {
    const d = toDateOrNull(inv.createdAt);
    if (!d) return sum;
    if (d >= from && d <= to) return sum + (inv.totalAmount || 0);
    return sum;
  }, 0);

export const calculateRevenueThisWeek = (invoices) => {
  const now = new Date();
  const from = startOfWeek(now);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return sumInvoicesBetween(invoices, from, to);
};

export const calculateRevenueThisMonth = (invoices) => {
  const now = new Date();
  const from = startOfMonth(now);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return sumInvoicesBetween(invoices, from, to);
};

export const calculateRevenueThisYear = (invoices) => {
  const now = new Date();
  const from = startOfYear(now);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return sumInvoicesBetween(invoices, from, to);
};
