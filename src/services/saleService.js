import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { Invoice } from "../models/Invoice";
import { getProductById, updateProduct } from "./productService";
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
  const q = query(salesCollectionRef, where("date", ">=", start), where("date", "<", end), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllInvoices = async () => {
  const snap = await getDocs(query(salesCollectionRef, orderBy("date", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const exportInvoicesToExcel = (invoices = [], filename = "invoices.xlsx") => {
  if (!Array.isArray(invoices)) invoices = [];
  const rows = invoices.map((inv) => ({
    Invoice: inv.invoiceNumber || inv.id,
    Date: inv.date ? new Date(inv.date).toLocaleString() : "",
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

export default {
  createInvoice,
  getInvoicesByMonthYear,
  getAllInvoices,
  exportInvoicesToExcel,
};
