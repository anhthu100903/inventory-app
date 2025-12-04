// SaleForm.jsx
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import styles from "./SaleForm.module.css";
import { formatCurrency } from "@shared/utils/formatUtils";
import useProductSearch from "@features/Sales/hooks/useProductSearch";

// Safe date converter
const getSafeDateString = (v) => {
  if (!v) return new Date().toISOString().slice(0, 10);
  try {
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime())
      ? new Date().toISOString().slice(0, 10)
      : d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

export default function SaleForm({ initialData = null, onSubmit, onCancel }) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: initialData
      ? {
          date: getSafeDateString(initialData.createdAt),
          customer: initialData.customer || "",
          items: initialData.items || [
            {
              productId: "",
              productName: "",
              quantity: 1,
              unitPrice: 0,
              unit: "Cái",
            },
          ],
          totalAmount: initialData.totalAmount || 0,
          note: initialData.note || "",
          printInvoice: false,
        }
      : {
          date: new Date().toISOString().slice(0, 10),
          customer: "",
          items: [
            {
              productId: "",
              productName: "",
              quantity: 1,
              unitPrice: 0,
              unit: "Cái",
            },
          ],
          totalAmount: 0,
          note: "",
          printInvoice: false,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // NEW: extracted search hook
  const { searchResults, loadingIndex, search, clearAt } = useProductSearch();
  const [selectedProducts, setSelectedProducts] = useState({});

  const items = watch("items") || [];
  const total = items.reduce(
    (sum, it) =>
      sum + Number(it.quantity || 0) * Number(it.unitPrice || 0),
    0
  );

  React.useEffect(() => {
    setValue("totalAmount", total);
  }, [total, setValue]);

  const onNameChange = (index, text) => {
    setSelectedProducts((prev) => {
      const cp = { ...prev };
      delete cp[index];
      return cp;
    });

    search(index, text);
  };

  const onSelectProduct = (index, p) => {
    const price = Math.round(
      Number(p.sellingPrice || p.averageImportPrice || 0)
    );

    setValue(`items.${index}.productId`, p.id);
    setValue(`items.${index}.productName`, p.name);
    setValue(`items.${index}.unitPrice`, price);
    setValue(`items.${index}.unit`, p.unit || "Cái");

    setSelectedProducts((prev) => ({
      ...prev,
      [index]: { id: p.id, price },
    }));

    clearAt(index);
  };

  const onLocalSubmit = (data) => {
    clearErrors();

    const finalItems = [];

    for (let i = 0; i < data.items.length; i++) {
      const it = data.items[i];

      if (!it.productName?.trim()) continue;

      if (!selectedProducts[i]) {
        setError("items", {
          type: "manual",
          message: `Sản phẩm dòng ${finalItems.length + 1} phải được chọn từ danh sách`,
        });
        return;
      }

      const qty = Math.round(Number(it.quantity));
      if (qty < 1) {
        setError("items", {
          type: "manual",
          message: `Sản phẩm dòng ${finalItems.length + 1}: Số lượng phải ≥ 1`,
        });
        return;
      }

      const price = selectedProducts[i].price;
      if (!price || price <= 0) {
        setError("items", {
          type: "manual",
          message: `Sản phẩm dòng ${finalItems.length + 1}: Giá phải > 0`,
        });
        return;
      }

      finalItems.push({
        productId: selectedProducts[i].id,
        productName: it.productName,
        quantity: qty,
        unitPrice: price,
        unit: it.unit || "",
      });
    }

    if (finalItems.length === 0) {
      setError("items", {
        type: "manual",
        message: "Phải có ít nhất 1 sản phẩm",
      });
      return;
    }

    data.items = finalItems;
    data.totalAmount = finalItems.reduce(
      (s, it) => s + it.quantity * it.unitPrice,
      0
    );

    onSubmit(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onLocalSubmit)}>
      {/* --- Thông tin cơ bản --- */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Ngày</label>
            <input type="date" {...register("date")} />
          </div>

          <div className={styles.field}>
            <label>Khách hàng</label>
            <input
              {...register("customer")}
              placeholder="Tên khách hàng (tùy chọn)"
            />
          </div>
        </div>
      </div>

      {/* --- Sản phẩm --- */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Sản phẩm</h3>

        {errors.items?.message && (
          <div className={styles.errorBox}>⚠ {errors.items.message}</div>
        )}

        <div className={styles.items}>
          {fields.map((f, idx) => (
            <div className={styles.itemRow} key={f.id}>
              {/* Product input + dropdown */}
              <div className={styles.productField}>
                <input
                  {...register(`items.${idx}.productName`)}
                  placeholder="Tên sản phẩm hoặc mã"
                  onChange={(e) => onNameChange(idx, e.target.value)}
                />

                {/* Dropdown */}
                {loadingIndex === idx ? (
                  <div className={styles.dropdown}>Đang tìm...</div>
                ) : searchResults[idx]?.length > 0 ? (
                  <div className={styles.dropdown}>
                    {searchResults[idx].map((p) => (
                      <div
                        key={p.id}
                        className={styles.dropdownItem}
                        onClick={() => onSelectProduct(idx, p)}
                      >
                        <div className={styles.dropdownName}>{p.name}</div>
                        <div className={styles.dropdownMeta}>
                          {p.unit} •{" "}
                          <span className={styles.price}>
                            {formatCurrency(p.sellingPrice || 0)} ₫
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Qty */}
              <div className={styles.field}>
                <label>Số lượng</label>
                <input
                  type="number"
                  {...register(`items.${idx}.quantity`)}
                  min="1"
                />
              </div>

              {/* Price */}
              <div className={styles.field}>
                <label>Đơn giá</label>
                <input
                  type="number"
                  {...register(`items.${idx}.unitPrice`)}
                  disabled
                />
              </div>

              {/* Unit */}
              <div className={styles.field}>
                <label>Đơn vị</label>
                <input
                  {...register(`items.${idx}.unit`)}
                  disabled
                />
              </div>

              {/* Remove */}
              <button
                type="button"
                className={styles.btnRemove}
                onClick={() => remove(idx)}
              >
                Xóa
              </button>
            </div>
          ))}

          <button
            type="button"
            className={styles.btnAdd}
            onClick={() =>
              append({
                productId: "",
                productName: "",
                quantity: 1,
                unitPrice: 0,
                unit: "Cái",
              })
            }
          >
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* --- Ghi chú & Tổng kết --- */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Ghi chú & Tổng kết</h3>

        <div className={styles.footer}>
          <textarea
            {...register("note")}
            placeholder="Ghi chú (tùy chọn)"
          />

          <label className={styles.checkboxLabel}>
            <input type="checkbox" {...register("printInvoice")} />
            <span>In hoá đơn sau khi lưu</span>
          </label>

          <div className={styles.totalDisplay}>
            Tổng:{" "}
            <span className={styles.totalAmount}>
              {formatCurrency(total)} ₫
            </span>
          </div>

          <div className={styles.actionButtons}>
            <button type="button" className={styles.btnCancel} onClick={onCancel}>
              Hủy
            </button>
            <button type="submit" className={styles.btnSubmit}>
              Lưu hoá đơn
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
