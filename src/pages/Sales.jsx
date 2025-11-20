import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import SaleForm from "../components/Sales/SaleForm";
import InvoiceList from "../components/Sales/InvoiceList";
import InvoiceDetail from "../components/Sales/InvoiceDetail";
import styles from "./Sales.module.css";
import { createInvoice, exportInvoicesToExcel, listenInvoicesByMonthYear, listenInvoicesByDate, updateInvoice, deleteInvoice, exportInvoicesByYear } from "../services/saleService";
import { buildInvoicePrintHTML, openInvoicePrintWindow } from "../utils/print/invoicePrinter";

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [yearError, setYearError] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // choose listener by date or by month/year
    let unsub = null;
    if (filterDate) {
      unsub = listenInvoicesByDate(filterDate, (items) => {
        setInvoices(items);
        setLoading(false);
      });
    } else {
      unsub = listenInvoicesByMonthYear(filterMonth, filterYear, (items) => {
        setInvoices(items);
        setLoading(false);
      });
    }
    return () => unsub && unsub();
  }, [filterMonth, filterYear, filterDate]);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const handleCreate = async (invoiceData) => {
    setLoading(true);
    try {
      // extract print flag
      const printFlag = !!invoiceData.printInvoice;
      const payload = { ...invoiceData };
      delete payload.printInvoice;
      const created = await createInvoice(payload);
      setShowForm(false);
      alert("Tạo hoá đơn thành công");
      if (printFlag) {
        // Use centralized print utility for consistent formatting
        const html = buildInvoicePrintHTML(created, {});
        openInvoicePrintWindow(html, `Hóa đơn ${created.invoiceNumber || created.id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo hoá đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    setLoading(true);
    try {
      await updateInvoice(id, data);
      setEditingInvoice(null);
      alert("Cập nhật hoá đơn thành công");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật hoá đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (inv) => {
    if (!window.confirm("Xác nhận xóa hoá đơn này?")) return;
    setLoading(true);
    try {
      await deleteInvoice(inv.id);
      alert("Xóa hoá đơn thành công");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa hoá đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleExportList = () => {
    exportInvoicesToExcel(invoices, `invoices_${filterYear}_${String(filterMonth).padStart(2, "0")}.xlsx`);
  };

  const handleExportYear = async () => {
    try {
      await exportInvoicesByYear(filterYear, `invoices_${filterYear}.xlsx`);
      alert("Xuất file Excel theo năm hoàn tất");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xuất Excel theo năm");
    }
  };

  return (
    <div className={styles.salesPage}>
      <div className={styles.header}>
        <h1>Bán hàng / Hóa đơn</h1>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <label>Tháng</label>
            <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterItem}>
            <label>Năm</label>
            <input
              type="number"
              value={filterYear}
              onChange={(e) => {
                const raw = e.target.value;
                const n = Number(raw);
                if (!raw) {
                  setFilterYear(0);
                  setYearError("");
                  return;
                }
                if (!/^[0-9]{1,4}$/.test(raw)) {
                  setYearError("Năm không hợp lệ (tối đa 4 chữ số)");
                  return;
                }
                if (n < 2000 || n > 2100) {
                  setYearError("Năm phải trong khoảng 2000-2100");
                  return;
                }
                setYearError("");
                setFilterYear(n);
              }}
              min="2000"
              max="2100"
            />
            {yearError && <span className={styles.error}>{yearError}</span>}
          </div>
          <div className={styles.filterItem}>
            <label>Ngày cụ thể</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
        </div>

        <div className={styles.actionGroup}>
          <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>Tạo hoá đơn mới</button>
          <button className={styles.btnSecondary} onClick={handleExportList}>Xuất Excel (tháng)</button>
          <button className={styles.btnSecondary} onClick={handleExportYear}>Xuất Excel (năm)</button>
        </div>
      </div>

      <InvoiceList invoices={invoices} loading={loading} onView={(inv) => setSelectedInvoice(inv)} onEdit={(inv) => setEditingInvoice(inv)} onDelete={handleDelete} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tạo hoá đơn bán hàng">
        <SaleForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={!!editingInvoice} onClose={() => setEditingInvoice(null)} title="Sửa hoá đơn">
        {editingInvoice && <SaleForm initialData={editingInvoice} onSubmit={(data) => handleUpdate(editingInvoice.id, data)} onCancel={() => setEditingInvoice(null)} />}
      </Modal>

      <InvoiceDetail invoice={selectedInvoice} open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
}