import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import styles from "./SaleForm.module.css";
import { searchProductsByNameWithFallback } from "../../services/productService";
import { formatCurrency } from "../../utils/formatUtils";

// Helper to safely convert date to ISO string format (YYYY-MM-DD)
const getSafeDateString = (dateValue) => {
  if (!dateValue) return new Date().toISOString().slice(0, 10);
  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().slice(0, 10); // Fallback to today
    }
    return date.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10); // Fallback to today
  }
};

export default function SaleForm({ initialData = null, onSubmit, onCancel }) {
  const { register, control, handleSubmit, setValue, watch, setError, clearErrors, formState: { errors } } = useForm({
    defaultValues: initialData ? {
      date: getSafeDateString(initialData.createdAt),
      customer: initialData.customer || "",
      items: initialData.items || [{ productId: "", productName: "", quantity: 1, unitPrice: 0, unit: "Cái" }],
      totalAmount: initialData.totalAmount || 0,
      note: initialData.note || "",
      printInvoice: false,
    } : {
      date: new Date().toISOString().slice(0, 10),
      customer: "",
      items: [
        { productId: "", productName: "", quantity: 1, unitPrice: 0, unit: "Cái" },
      ],
      totalAmount: 0,
      note: "",
      printInvoice: false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const [searchResults, setSearchResults] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({}); // Track which products are properly selected from DB
  const searchTimersRef = useRef({});

  const watchedItems = watch("items") || [];
  const total = watchedItems.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  React.useEffect(() => setValue("totalAmount", total), [total, setValue]);
  
  // Debounced search per row index to improve reliability
  const handleSearchProduct = (index, name) => {
    // clear previous timer for this index
    if (searchTimersRef.current[index]) {
      clearTimeout(searchTimersRef.current[index]);
    }

    if (!name || name.trim().length < 2) {
      setSearchResults((p) => ({ ...p, [index]: [] }));
      return;
    }

    // debounce 300ms
    searchTimersRef.current[index] = setTimeout(async () => {
      setLoadingIndex(index);
      try {
        const q = name.trim();
        const results = await searchProductsByNameWithFallback(q);
        setSearchResults((p) => ({ ...p, [index]: results }));
      } catch (err) {
        console.error(err);
        setSearchResults((p) => ({ ...p, [index]: [] }));
      } finally {
        setLoadingIndex(null);
      }
    }, 300);
  };

  const handleSelectProduct = (index, product) => {
    setValue(`items.${index}.productId`, product.id);
    setValue(`items.${index}.productName`, product.name);
    // Lock price to database value - convert to integer
    const dbPrice = Math.round(Number(product.sellingPrice || product.averageImportPrice || 0));
    setValue(`items.${index}.unitPrice`, dbPrice);
    setValue(`items.${index}.unit`, product.unit || "Cái");
    // Track that this item was properly selected from DB
    setSelectedProducts((prev) => ({ ...prev, [index]: { id: product.id, price: dbPrice } }));
    // clear search results for that index
    setSearchResults((p) => ({ ...p, [index]: [] }));
  };

  // If user edits productName after selection, clear the selectedProducts entry
  const handleProductNameChange = (index, value) => {
    // Clear selection whenever user types to ensure user must re-select from DB
    setSelectedProducts((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    handleSearchProduct(index, value);
  };

  // wrapper for submit: validate items and rounding
  const onLocalSubmit = (data) => {
    clearErrors();

    const items = data.items || [];
    const finalItems = [];

    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      if (!it || !it.productName || !it.productName.trim()) continue; // skip empty rows

      // Check product selection at original index
      if (!selectedProducts[idx] || !selectedProducts[idx].id) {
        setError("items", { type: "manual", message: `Sản phẩm dòng ${finalItems.length + 1} phải được chọn từ danh sách (không được nhập tay)` });
        return;
      }

      if (!it.productName || it.productName.length < 2) {
        setError("items", { type: "manual", message: `Sản phẩm dòng ${finalItems.length + 1}: Tên sản phẩm quá ngắn` });
        return;
      }

      const qty = Math.round(Number(it.quantity || 0));
      if (!qty || qty < 1) {
        setError("items", { type: "manual", message: `Sản phẩm dòng ${finalItems.length + 1}: Số lượng phải lớn hơn hoặc bằng 1` });
        return;
      }

      const dbPrice = selectedProducts[idx].price || Math.round(Number(it.unitPrice || 0));
      if (!dbPrice || dbPrice <= 0) {
        setError("items", { type: "manual", message: `Sản phẩm dòng ${finalItems.length + 1}: Giá đơn vị phải lớn hơn 0` });
        return;
      }

      finalItems.push({
        productId: selectedProducts[idx].id,
        productName: it.productName,
        quantity: qty,
        unitPrice: dbPrice,
        unit: it.unit || "",
      });
    }

    if (finalItems.length === 0) {
      setError("items", { type: "manual", message: "Phải có ít nhất 1 sản phẩm" });
      return;
    }

    data.items = finalItems;
    data.totalAmount = finalItems.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);

    onSubmit(data);
  };

  // use handleSubmit wrapper to run local validation first
  const wrappedSubmit = handleSubmit(onLocalSubmit);

  return (
    <form className={styles.form} onSubmit={wrappedSubmit}>
      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Ngày</label>
            <input type="date" {...register("date")} />
          </div>
          <div className={styles.field}>
            <label>Khách hàng</label>
            <input {...register("customer")} placeholder="Tên khách hàng (tùy chọn)" />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Sản phẩm</h3>
        {watch("items")?.length === 0 && (
          <div style={{ color: "#d9534f", marginBottom: "10px", fontSize: "13px" }}>
            ⚠ Phải có ít nhất 1 sản phẩm
          </div>
        )}
        {errors.items?.message && (
          <div style={{ color: "#d9534f", marginBottom: "10px", fontSize: "13px", fontWeight: "bold" }}>
            ⚠ {errors.items.message}
          </div>
        )}
        <div className={styles.items}>
          {fields.map((f, idx) => (
            <div className={styles.itemRow} key={f.id}>
                <div className={styles.productField}>
                <input {...register(`items.${idx}.productName`)} placeholder="Tên sản phẩm hoặc mã" onChange={(e) => handleProductNameChange(idx, e.target.value)} />
                {loadingIndex === idx ? (
                  <div className={styles.dropdown}>Đang tìm...</div>
                ) : (searchResults[idx] && searchResults[idx].length > 0) ? (
                  <div className={styles.dropdown}>
                    {searchResults[idx].map(p => (
                      <div key={p.id} className={styles.dropdownItem} onClick={() => handleSelectProduct(idx, p)}>
                        <div className={styles.dropdownName}>{p.name}</div>
                        <div className={styles.dropdownMeta}>{p.unit} • <span className={styles.price}>{formatCurrency(p.sellingPrice || 0)} ₫</span></div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className={styles.field}>
                <label>Số lượng</label>
                <input inputMode="numeric" pattern="[0-9]*" type="number" {...register(`items.${idx}.quantity`)} min="1" step="1" />
              </div>
              <div className={styles.field}>
                <label>Đơn giá</label>
                <input inputMode="numeric" pattern="[0-9]*" type="number" {...register(`items.${idx}.unitPrice`)} min="0" step="1" disabled readOnly />
              </div>
              <div className={styles.field}>
                <label>Đơn vị</label>
                <input {...register(`items.${idx}.unit`)} placeholder="Cái" disabled readOnly />
              </div>
              <button type="button" className={styles.btnRemove} onClick={() => {
                remove(idx);
                setSelectedProducts((prev) => {
                  const updated = { ...prev };
                  delete updated[idx];
                  return updated;
                });
              }}>Xóa</button>
            </div>
          ))}
          <button type="button" className={styles.btnAdd} onClick={() => append({ productId: "", productName: "", quantity: 1, unitPrice: 0, unit: "Cái" })}>Thêm sản phẩm</button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Ghi chú & Tổng kết</h3>
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <textarea {...register("note")} placeholder="Ghi chú (tùy chọn)" rows={2} />
            <label className={styles.checkboxLabel}>
              <input type="checkbox" {...register('printInvoice')} />
              <span>In hoá đơn sau khi lưu</span>
            </label>
          </div>
          <div className={styles.footerRight}>
            <div className={styles.totalDisplay}>Tổng: <span className={styles.totalAmount}>{formatCurrency(total)} ₫</span></div>
            <div className={styles.actionButtons}>
              <button type="button" className={styles.btnCancel} onClick={onCancel}>Hủy</button>
              <button type="submit" className={styles.btnSubmit}>Lưu hoá đơn</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}