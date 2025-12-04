import React, { useState } from "react";
import styles from "./Sales.module.css";

import Modal from "@components/Modal";
import SaleForm from "@features/Sales/components/SaleForm/SaleForm";
import InvoiceList from "@features/Sales/components/InvoiceList/InvoiceList";
import InvoiceDetail from "@features/Sales/components/InvoiceDetail/InvoiceDetail";

import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  exportInvoicesToExcel,
  exportInvoicesByYear,
} from "../../../services/saleService";

import { useInvoiceListener } from "../hooks/useInvoiceListener";
import { buildInvoicePrintHTML, openInvoicePrintWindow } from "../../../shared/utils/invoicePrinter";

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterDate, setFilterDate] = useState("");

  const [yearError, setYearError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const { invoices, loading } = useInvoiceListener({
    filterMonth,
    filterYear,
    filterDate,
  });

  // -----------------------------
  // Actions
  // -----------------------------
  const handleCreate = async (data) => {
    try {
      const printFlag = data.printInvoice;
      const payload = { ...data };
      delete payload.printInvoice;

      const created = await createInvoice(payload);
      setShowForm(false);
      alert("Tạo hoá đơn thành công");

      if (printFlag) {
        const html = buildInvoicePrintHTML(created, {});
        openInvoicePrintWindow(html, `Hóa đơn ${created.invoiceNumber || created.id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo hoá đơn");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateInvoice(id, data);
      alert("Cập nhật hoá đơn thành công");
      setEditingInvoice(null);
    } catch {
      alert("Lỗi khi cập nhật hoá đơn");
    }
  };

  const handleDelete = async (inv) => {
    if (!window.confirm("Xác nhận xóa hoá đơn này?")) return;
    try {
      await deleteInvoice(inv.id);
      alert("Xóa hoá đơn thành công");
    } catch {
      alert("Lỗi khi xóa hoá đơn");
    }
  };

  const handleExportMonth = () => {
    const file = `invoices_${filterYear}_${String(filterMonth).padStart(2, "0")}.xlsx`;
    exportInvoicesToExcel(invoices, file);
  };

  const handleExportYear = async () => {
    try {
      await exportInvoicesByYear(filterYear, `invoices_${filterYear}.xlsx`);
      alert("Xuất file thành công");
    } catch {
      alert("Lỗi khi xuất file");
    }
  };

  // -----------------------------
  // Year validation
  // -----------------------------
  const validateYear = (raw) => {
    const n = Number(raw);
    if (!raw) return setYearError(""), setFilterYear(0);
    if (!/^[0-9]{1,4}$/.test(raw)) return setYearError("Năm không hợp lệ");
    if (n < 2000 || n > 2100) return setYearError("Năm phải 2000–2100");
    setYearError("");
    setFilterYear(n);
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className={styles.salesPage}>
      <div className={styles.header}><h1>Bán hàng / Hóa đơn</h1></div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>

          <div className={styles.filterItem}>
            <label>Tháng</label>
            <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label>Năm</label>
            <input type="number" value={filterYear} onChange={(e) => validateYear(e.target.value)} />
            {yearError && <span className={styles.error}>{yearError}</span>}
          </div>

          <div className={styles.filterItem}>
            <label>Ngày cụ thể</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
        </div>

        <div className={styles.actionGroup}>
          <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>Tạo hoá đơn mới</button>
          <button className={styles.btnSecondary} onClick={handleExportMonth}>Xuất Excel (tháng)</button>
          <button className={styles.btnSecondary} onClick={handleExportYear}>Xuất Excel (năm)</button>
        </div>
      </div>

      <InvoiceList
        invoices={invoices}
        loading={loading}
        onView={setSelectedInvoice}
        onEdit={setEditingInvoice}
        onDelete={handleDelete}
      />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tạo hoá đơn">
        <SaleForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={!!editingInvoice} onClose={() => setEditingInvoice(null)} title="Sửa hoá đơn">
        {editingInvoice && (
          <SaleForm
            initialData={editingInvoice}
            onSubmit={(data) => handleUpdate(editingInvoice.id, data)}
            onCancel={() => setEditingInvoice(null)}
          />
        )}
      </Modal>

      <InvoiceDetail invoice={selectedInvoice} open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
}
