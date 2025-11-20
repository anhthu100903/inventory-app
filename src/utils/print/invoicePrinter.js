import { STORE_INFO } from "../../config/storeConfig";
import { formatCurrency, toSafeDate } from "../formatUtils";

/**
 * Build a complete invoice print HTML with store info, items table, and footer
 * @param {object} invoice - Invoice object with id, invoiceNumber, date, customer, items, totalAmount, note
 * @param {object} options - Optional overrides (storeInfo, itemsToDisplay)
 * @returns {string} HTML string ready for printing
 */
export const buildInvoicePrintHTML = (invoice, options = {}) => {
    if (!invoice) return "";

    const store = options.storeInfo || STORE_INFO;
    const items = options.itemsToDisplay || invoice.items || [];

    const dateStr = invoice.createdAt
        ? toSafeDate(invoice.createdAt)?.toLocaleDateString("vi-VN")
        : new Date().toLocaleDateString("vi-VN");

    const customerStr = invoice.customer || "Khách lẻ";
    const totalStr = formatCurrency(invoice.totalAmount || 0);
    const invoiceNumberStr = invoice.invoiceNumber || invoice.id;

    const itemRows = items
        .map((it, i) => {
            const qty = Number(it.quantity || 0);
            const price = Number(it.unitPrice || it.importPrice || 0);
            const name = it.productDetails?.name || it.productName || it.name || "";
            const unit = it.unit || it.productDetails?.unit || "";

            return `
              <tr>
                <td>${i + 1}</td>
                <td>${name}</td>
                <td>${unit}</td>
                <td class="right">${qty.toFixed(0)}</td>
                <td class="right">${formatCurrency(price)}</td>
                <td class="right">${formatCurrency(qty * price)}</td>
              </tr>`;
        })
        .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      padding: 20px; 
      margin: 0; 
      font-size: 13px;
      line-height: 1.4;
      background: #f5f5f5;
    }
    .page {
      background: white;
      padding: 30px;
      margin: 0 auto;
      max-width: 800px;
      box-shadow: 0 0 8px rgba(0,0,0,0.1);
    }
    .top-right { 
      text-align: right; 
      margin-bottom: 15px;
      font-size: 12px;
      color: #666;
    }
    .header { 
      margin-bottom: 20px;
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .store-name { 
      font-size: 18px; 
      font-weight: bold;
      margin-bottom: 5px;
    }
    .store-info { 
      font-size: 11px; 
      color: #444;
    }
    .invoice-title {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      margin: 15px 0;
      text-decoration: underline;
    }
    .invoice-meta {
      gap: 10px;
      margin-bottom: 15px;
      font-size: 12px;
    }
    .invoice-meta div {
      display: block;
    }
    .invoice-meta strong {
      min-width: 100px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0;
      border: 1px solid #000;
    }
    thead { background: #f0f0f0; }
    th { 
      border: 1px solid #000; 
      padding: 8px; 
      text-align: left;
      font-weight: bold;
      font-size: 12px;
    }
    td { 
      border: 1px solid #000; 
      padding: 8px; 
      font-size: 12px;
    }
    tbody tr:last-child { font-weight: bold; background: #f9f9f9; }
    .right { text-align: right; }
    .footer { 
      margin-top: 30px; 
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      text-align: center;
      font-size: 11px;
    }
    .signature-box {
      border-top: 1px solid #000;
      padding-top: 40px;
      height: 80px;
    }
    .note {
      margin-top: 10px;
      padding: 10px;
      background: #f9f9f9;
      border-left: 3px solid #0066cc;
      font-size: 11px;
      font-style: italic;
    }
    .thank-you {
      position: fixed;
      bottom: 20px;
      width: 100%;
      text-align: center;
      font-style: italic;
      color: #666;
    }
      
    @media print {
      body { background: white; }
      .page { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    
    <div class="header">
      <div class="store-name">${store.name}</div>
      <div class="store-info">Địa chỉ: ${store.address}</div>
      <div class="store-info">Điện thoại: ${store.phone}</div>
    </div>

    <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>

    <div class="invoice-meta">
      <div><strong>Mã hóa đơn:</strong> <span>${invoiceNumberStr}</span></div>
      <div><strong>Ngày:</strong> <span>${dateStr}</span></div>
      <div><strong>Khách hàng:</strong> <span>${customerStr}</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Sản phẩm</th>
          <th>Đơn vị</th>
          <th class="right">Số lượng</th>
          <th class="right">Đơn giá</th>
          <th class="right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr>
          <td colspan="5" class="right">Tổng cộng:</td>
          <td class="right">${totalStr} ₫</td>
        </tr>
      </tbody>
    </table>

    ${invoice.note ? `<div class="note"><strong>Ghi chú:</strong> ${invoice.note}</div>` : ""}

    <div class="footer">
      <div class="signature-box">
        <strong>Người bán</strong><br/>
        (Ký và ghi rõ họ tên)
      </div>
      <div class="signature-box">
        <strong>Khách hàng</strong><br/>
        (Ký và ghi rõ họ tên)
      </div>
    </div>

    <div class="thank-you">
      ✪ Cảm ơn quý khách! Hẹn gặp lại ✪
    </div>
  </div>
</body>
</html>
`;

    return html;
};

/**
 * Open a new window and trigger print dialog
 * @param {string} htmlContent - HTML content to print
 * @param {string} title - Window/document title
 */
export const openInvoicePrintWindow = (htmlContent, title = "Hóa đơn") => {
    const w = window.open("", "_blank");
    if (!w) {
        alert("Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép popup.");
        return;
    }

    w.document.open();
    w.document.write(htmlContent);
    w.document.close();
    w.document.title = title;
    w.focus();

    // Delay print slightly to ensure document is rendered
    setTimeout(() => {
        w.print();
    }, 500);
};
