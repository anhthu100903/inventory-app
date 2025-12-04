import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, onSnapshot, getDoc, deleteDoc } from "firebase/firestore";
import { Invoice } from "@models/Invoice";
import { getProductById, updateProduct } from "@services/productService";
import * as XLSX from "xlsx";

const SALES_COLLECTION = "sales";
const salesCollectionRef = collection(db, SALES_COLLECTION);

export const generateInvoiceNumber = () => {
  const now = new Date();
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${now.getTime().toString().slice(-5)}`;
};

export const createInvoice = async (invoiceData) => {
  const invoice = invoiceData instanceof Invoice ? invoiceData : new Invoice(invoiceData);
  if (!invoice.invoiceNumber) invoice.invoiceNumber = generateInvoiceNumber();

  // Persist invoice
  const docRef = await addDoc(salesCollectionRef, invoice.toFirestore());

  // Update product stocks for each sold item
  for (const item of invoice.items) {
    try {
      if (!item.productId) continue; // skip new products handled elsewhere
      const product = await getProductById(item.productId);
      if (!product) continue;
      const newStock = (product.totalInStock || 0) - (Number(item.quantity) || 0);
      const newTotalSold = (product.totalSold || 0) + (Number(item.quantity) || 0);
      await updateProduct(product.id, {
        totalInStock: newStock < 0 ? 0 : newStock,
        totalSold: newTotalSold,
      });
    } catch (err) {
      console.error("Failed to update stock for item", item, err);
    }
  }

  return { id: docRef.id, ...invoice };
};

export const getInvoicesByMonthYear = async (month, year) => {
  // month: 1-12
  const start = new Date(year, month - 1, 1, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0); // next month
  const q = query(salesCollectionRef, where("createdAt", ">=", start), where("createdAt", "<", end), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const listenInvoicesByMonthYear = (month, year, callback) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0);
  const q = query(salesCollectionRef, where("createdAt", ">=", start), where("createdAt", "<", end), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    // filter out soft-deleted documents client-side to avoid query limitations
    const items = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((it) => it.isDeleted !== true);
    callback(items);
  });
};

export const listenInvoicesByDate = (date, callback) => {
  // date: YYYY-MM-DD or Date
  const day = new Date(date);
  if (isNaN(day.getTime())) return () => {};
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 0, 0, 0);
  const q = query(salesCollectionRef, where("createdAt", ">=", start), where("createdAt", "<", end), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(it => it.isDeleted !== true);
    callback(items);
  });
};

export const updateInvoice = async (id, invoiceData) => {
  const docRef = doc(db, SALES_COLLECTION, id);
  await updateDoc(docRef, { ...invoiceData, updatedAt: new Date() });
};

export const deleteInvoice = async (id) => {
  const docRef = doc(db, SALES_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Invoice not found");
  const inv = snap.data();

  // Restore stock for each item
  for (const item of (inv.items || [])) {
    if (item.productId) {
      try {
        const p = await getProductById(item.productId);
        if (p) {
          await updateProduct(item.productId, {
            totalInStock: (p.totalInStock || 0) + (Number(item.quantity) || 0),
            totalSold: Math.max(0, (p.totalSold || 0) - (Number(item.quantity) || 0)),
          });
        }
      } catch (err) {
        console.error("Failed to restore stock for item", item, err);
      }
    }
  }

  // Hard-delete (not soft-delete)
  await deleteDoc(docRef);
};

export const getAllInvoices = async () => {
  const snap = await getDocs(query(salesCollectionRef, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const exportInvoicesToExcel = (invoices = [], filename = "invoices.xlsx") => {
  if (!Array.isArray(invoices)) invoices = [];
  const rows = invoices.map((inv) => ({
    Invoice: inv.invoiceNumber || inv.id,
    Date: inv.createdAt ? new Date(inv.createdAt).toLocaleString() : "",
    Customer: inv.customer || "",
    Items: (inv.items || []).map((it) => `${it.name || it.productName} x${it.quantity}`).join("; "),
    Total: inv.totalAmount || 0,
    Note: inv.note || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");
  XLSX.writeFile(wb, filename);
};

export const exportInvoicesByYear = async (year, filename = `invoices_${year}.xlsx`) => {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  for (let month = 1; month <= 12; month++) {
    const invs = await getInvoicesByMonthYear(month, year);
    const rows = invs.map((inv) => ({
      Invoice: inv.invoiceNumber || inv.id,
      Date: inv.createdAt ? new Date(inv.createdAt).toLocaleString() : "",
      Customer: inv.customer || "",
      Items: (inv.items || []).map((it) => `${it.name || it.productName} x${it.quantity}`).join("; "),
      Total: inv.totalAmount || 0,
      Note: inv.note || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const sheetName = String(month).padStart(2, '0');
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }
  XLSX.writeFile(wb, filename);
};

export default {
  createInvoice,
  getInvoicesByMonthYear,
  getAllInvoices,
  exportInvoicesToExcel,
};
