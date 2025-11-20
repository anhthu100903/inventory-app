import React, { useEffect, useState } from "react";
import Modal from "../Modal";
import { getProductById } from "../../services/productService";
import { formatCurrency, toSafeDate } from "../../utils/formatUtils";
import styles from "./InvoiceDetail.module.css";
import { buildInvoicePrintHTML, openInvoicePrintWindow } from "../../utils/print/invoicePrinter";

/**
 * InvoiceDetail - Modal component to view and print invoice details
 * Supports both 'open' and 'isOpen' props for compatibility
 */
export default function InvoiceDetail({ invoice, isOpen, open, onClose }) {
  // Support both open and isOpen for backward compatibility
  const modalOpen = open !== undefined ? open : isOpen;
  const [items, setItems] = useState([]);

  // Load product details for each item in the invoice
  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      if (!invoice?.items) {
        setItems([]);
        return;
      }

      try {
        const list = await Promise.all(
          (invoice.items || []).map(async (item) => {
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

  // Handle print - uses centralized printer utility
  const handlePrint = () => {
    const html = buildInvoicePrintHTML(invoice, { itemsToDisplay: items });
    openInvoicePrintWindow(html, `Hóa đơn ${invoice.invoiceNumber || invoice.id}`);
  };

  return (
    <Modal
      isOpen={modalOpen}
      onClose={onClose}
      title={`Hoá đơn: ${invoice.invoiceNumber || invoice.id}`}
    >
      <div className={styles.container}>
        {/* Header with basic info */}
        <div className={styles.header}>
          <div><strong>Ngày:</strong> {toSafeDate(invoice.createdAt)?.toLocaleString() || ""}</div>
          <div><strong>Khách:</strong> {invoice.customer || ""}</div>
          <div><strong>Tổng:</strong> {formatCurrency(invoice.totalAmount)} ₫</div>
        </div>

        {/* Items list */}
        <div className={styles.items}>
          {(items || []).map((it, i) => (
            <div key={i} className={styles.itemRow}>
              <div className={styles.left}>
                <div className={styles.name}>
                  {it.productDetails?.name || it.productName || "N/A"}
                </div>

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
                  Tạm tính: {formatCurrency((Number(it.quantity || 0)) * (Number(it.unitPrice || 0)))} ₫
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note section */}
        {invoice.note && (
          <div className={styles.note}>
            <strong>Ghi chú:</strong> {invoice.note}
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          <button className={styles.btnPrint} onClick={handlePrint}>
            In / Xuất PDF
          </button>
        </div>
      </div>
    </Modal>
  );
}