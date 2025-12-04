import React, { useEffect, useState } from "react";
import Modal from "@components/Modal";
import { getProductById } from "@services/productService";
import { formatCurrency, toSafeDate } from "@shared/utils/formatUtils";
import styles from "./InvoiceDetail.module.css";
import { buildInvoicePrintHTML, openInvoicePrintWindow } from "@shared/utils/invoicePrinter";    

export default function InvoiceDetail({ invoice, isOpen, open, onClose }) {
  const modalOpen = open !== undefined ? open : isOpen;
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadItems = async () => {
      if (!invoice?.items) {
        if (mounted) setItems([]);
        return;
      }

      try {
        const list = await Promise.all(
          invoice.items.map(async (item) => {
            if (!item.productId) return { ...item };
            try {
              const p = await getProductById(item.productId);
              return { ...item, productDetails: p };
            } catch (err) {
              console.warn("Failed to load product details for item", item, err);
              return { ...item };
            }
          })
        );

        if (mounted) setItems(list);
      } catch (err) {
        console.error("Error loading invoice items", err);
      }
    };

    loadItems();
    return () => (mounted = false);
  }, [invoice]);

  if (!invoice) return null;

  const handlePrint = () => {
    const html = buildInvoicePrintHTML(invoice, { itemsToDisplay: items });
    openInvoicePrintWindow(html, `Hóa đơn ${invoice.invoiceNumber || invoice.id}`);
  };

  return (
    <Modal isOpen={modalOpen} onClose={onClose} title={`Hoá đơn: ${invoice.invoiceNumber || invoice.id}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div><strong>Ngày:</strong> {toSafeDate(invoice.createdAt)?.toLocaleString() || ""}</div>
          <div><strong>Khách:</strong> {invoice.customer || ""}</div>
          <div><strong>Tổng:</strong> {formatCurrency(invoice.totalAmount)} ₫</div>
        </div>

        <div className={styles.items}>
          {items.map((it, i) => (
            <div key={i} className={styles.itemRow}>
              <div className={styles.left}>
                <div className={styles.name}>{it.productDetails?.name || it.productName || "N/A"}</div>

                <div className={styles.meta}>
                  {it.productDetails ? (
                    <>
                      <span>SKU: {it.productDetails.sku}</span>
                      <span> • Loại: {it.productDetails.category || "N/A"}</span>
                      <span> • Đơn vị: {it.productDetails.unit}</span>
                    </>
                  ) : (
                    it.category && <span>Phân loại: {it.category}</span>
                  )}
                </div>
              </div>

              <div className={styles.right}>
                <div>Số lượng: {Number(it.quantity || 0).toFixed(0)}</div>
                <div>Đơn giá: {formatCurrency(it.unitPrice || 0)} ₫</div>
                <div className={styles.subtotal}>
                  Tạm tính: {formatCurrency(Number(it.quantity || 0) * Number(it.unitPrice || 0))} ₫
                </div>
              </div>
            </div>
          ))}
        </div>

        {invoice.note && (
          <div className={styles.note}>
            <strong>Ghi chú:</strong> {invoice.note}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.btnPrint} onClick={handlePrint}>In / Xuất PDF</button>
        </div>
      </div>
    </Modal>
  );
}