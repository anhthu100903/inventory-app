import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import SaleForm from "../components/Sales/SaleForm";
import InvoiceList from "../components/Sales/InvoiceList";
import styles from "./Sales.module.css";
import { createInvoice, getInvoicesByMonthYear, exportInvoicesToExcel } from "../services/saleService";

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoicesByMonthYear(filterMonth, filterYear);
      setInvoices(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải hoá đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [filterMonth, filterYear]);

  const handleCreate = async (invoiceData) => {
    setLoading(true);
    try {
      await createInvoice(invoiceData);
      setShowForm(false);
      await loadInvoices();
      alert("Tạo hoá đơn thành công");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo hoá đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleExportList = () => {
    exportInvoicesToExcel(invoices, `invoices_${filterYear}_${String(filterMonth).padStart(2, "0")}.xlsx`);
  };

  return (
    <div className={styles.salesPage}>
      <h1>Bán hàng / Hóa đơn</h1>

      <div className={styles.toolbar}>
        <div>
          <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <input type="number" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} style={{ width: 100, marginLeft: 8 }} />
          <button onClick={loadInvoices} style={{ marginLeft: 8 }}>Tải</button>
        </div>

        <div>
          <button onClick={() => setShowForm(true)}>Tạo hoá đơn mới</button>
          <button onClick={handleExportList} style={{ marginLeft: 8 }}>Xuất Excel (tháng)</button>
        </div>
      </div>

      <InvoiceList invoices={invoices} loading={loading} onReload={loadInvoices} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tạo hoá đơn bán hàng">
        <SaleForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
export default function Sales() {   
  return (
    <div>
      <h1>Sales</h1>
    </div>
  );
}
