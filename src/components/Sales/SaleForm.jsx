import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import styles from "./SaleForm.module.css";

export default function SaleForm({ initialData = null, onSubmit, onCancel }) {
  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: initialData || {
      date: new Date().toISOString().slice(0, 10),
      customer: "",
      items: [
        { productId: "", productName: "", quantity: 1, unitPrice: 0, unit: "Cái" },
      ],
      totalAmount: 0,
      note: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items") || [];
  const total = watchedItems.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  React.useEffect(() => setValue("totalAmount", total), [total, setValue]);

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.row}>
        <label>Ngày</label>
        <input type="date" {...register("date")} />
        <label>Khách hàng</label>
        <input {...register("customer")} placeholder="Tên khách hàng (tùy chọn)" />
      </div>

      <div className={styles.items}>
        {fields.map((f, idx) => (
          <div className={styles.itemRow} key={f.id}>
            <input {...register(`items.${idx}.productName`)} placeholder="Tên sản phẩm" />
            <input type="number" {...register(`items.${idx}.quantity`)} min="1" />
            <input type="number" {...register(`items.${idx}.unitPrice`)} min="0" />
            <input {...register(`items.${idx}.unit`)} placeholder="Đơn vị" />
            <button type="button" onClick={() => remove(idx)}>Xóa</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ productId: "", productName: "", quantity: 1, unitPrice: 0, unit: "Cái" })}>Thêm sản phẩm</button>
      </div>

      <div className={styles.footer}>
        <div>Tổng: {total.toLocaleString()} ₫</div>
        <div>
          <button type="button" onClick={onCancel}>Hủy</button>
          <button type="submit">Lưu hoá đơn</button>
        </div>
      </div>
    </form>
  );
}
