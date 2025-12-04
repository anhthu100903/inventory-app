// inventory-app/src/components/Product/ProductForm.jsx
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import useSuppliers from "@shared/hooks/useSuppliers";
import useCategories from "@shared/hooks/useCategories";
import { calculateSellingPrice } from "@shared/utils/priceUtils";
import { capitalizeText } from "@shared/utils/stringUtils";
import styles from "./ProductForm.module.css";

const TAX_RATE = Number(import.meta.env.VITE_TAX_RATE || 0);

export default function ProductForm({ initialData, onSubmit, onCancel, loading = false }) {
  // --- Suppliers ---
  const {
    suppliers,
    filteredSuppliers,
    selectedSupplier,
    setSelectedSupplier,
    search: supplierSearch,
    setSearch: setSupplierSearch,
    addNewSupplier,
  } = useSuppliers(initialData?.supplier || null);

  // --- Categories ---
  const {
    filteredCategories,
    search: catSearch,
    setSearch: setCatSearch,
    addNewCategory,
  } = useCategories();

  // --- Form default values ---
  const defaultValues = useMemo(() => ({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "",
    unit: initialData?.unit || "",
    totalInStock: initialData?.totalInStock || 0,
    profitPercent: initialData?.profitPercent || 10,
    averageImportPrice: initialData?.averageImportPrice || 0,
    sellingPrice: initialData?.sellingPrice || 0,
  }), [initialData]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isValid } } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const profitPercent = watch("profitPercent");
  const importPrice = watch("averageImportPrice");
  const currentCategory = watch("category");

  // --- Display categories for select: include current if not in filtered ---
  const displayCategories = useMemo(() => {
    if (filteredCategories.includes(currentCategory)) return filteredCategories;
    return currentCategory ? [currentCategory, ...filteredCategories] : filteredCategories;
  }, [filteredCategories, currentCategory]);

  // --- Auto calculate selling price ---
  useEffect(() => {
    setValue("sellingPrice", calculateSellingPrice(importPrice, profitPercent, TAX_RATE));
  }, [importPrice, profitPercent, setValue]);

  // --- Reset form when initialData changes ---
  useEffect(() => reset(defaultValues), [defaultValues, reset]);

  // --- Submit handler ---
  const handleFormSubmit = (data) => {
    const submitData = {
      ...data,
      name: capitalizeText(data.name),
      unit: capitalizeText(data.unit),
      supplier: selectedSupplier?.name || "",
      totalInStock: Number(data.totalInStock || 0),
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      {/* Product name */}
      <div className={styles.formGroup}>
        <label>Tên sản phẩm <span className={styles.required}>*</span></label>
        <input {...register("name", { required: "Tên sản phẩm không được để trống" })} type="text" placeholder="Nhập tên sản phẩm" className={styles.input} />
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}
      </div>

      {/* SKU */}
      <div className={styles.formGroup}>
        <label>SKU</label>
        <input {...register("sku")} type="text" placeholder="Tự động sinh nếu trống" className={styles.input} disabled />
      </div>

      {/* Category */}
      <div className={styles.formGroup}>
        <label>Phân loại</label>
        <div className={styles.categoryWrapper}>
          <input
            type="text"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            placeholder="Tìm kiếm phân loại..."
            className={styles.searchInput}
          />
          {catSearch && (
            <div className={styles.searchResults}>
              {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                <div key={cat} className={styles.searchResultItem} onClick={() => { setValue("category", cat); setCatSearch(""); }}>
                  {cat}
                </div>
              )) : (
                <div className={styles.noResults}>Không tìm thấy phân loại</div>
              )}
            </div>
          )}
          <select {...register("category")} className={styles.select}>
            <option value="">-- Chọn phân loại --</option>
            {displayCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button type="button" onClick={() => addNewCategory(catSearch)} className={styles.addCategoryBtn} title="Thêm phân loại mới">+</button>
        </div>
      </div>

      {/* Unit */}
      <div className={styles.formGroup}>
        <label>Đơn vị <span className={styles.required}>*</span></label>
        <input {...register("unit", { required: "Đơn vị không được để trống" })} type="text" placeholder="vd: Cái, Chiếc, Bộ..." className={styles.input} />
        {errors.unit && <p className={styles.error}>{errors.unit.message}</p>}
      </div>

      {/* Stock */}
      <div className={styles.formGroup}>
        <label>Số lượng tồn kho ban đầu</label>
        <input {...register("totalInStock")} type="number" min="0" step="1" className={styles.input} />
      </div>

      {/* Supplier */}
      <div className={styles.formGroup}>
        <label>Nhà cung cấp</label>
        <input
          type="text"
          value={supplierSearch}
          onChange={(e) => setSupplierSearch(e.target.value)}
          placeholder="Tìm kiếm nhà cung cấp..."
          className={styles.searchInput}
        />
        {supplierSearch && (
          <div className={styles.searchResults}>
            {filteredSuppliers.length > 0 ? filteredSuppliers.map((sup) => (
              <div key={sup.id} className={styles.searchResultItem} onClick={() => { setSelectedSupplier(sup); setSupplierSearch(""); }}>
                {sup.name}
              </div>
            )) : (
              <div className={styles.noResults}>Không tìm thấy nhà cung cấp</div>
            )}
          </div>
        )}
        <select
          value={selectedSupplier?.id || ""}
          onChange={(e) => setSelectedSupplier(suppliers.find(s => s.id === e.target.value) || null)}
          className={styles.select}
        >
          <option value="">-- Chọn nhà cung cấp --</option>
          {suppliers.map((sup) => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
        </select>
        <button type="button" onClick={addNewSupplier} className={styles.addCategoryBtn} title="Thêm nhà cung cấp mới">+</button>
        {selectedSupplier && <small style={{ color: "#666" }}>Đã chọn: {selectedSupplier.name}</small>}
      </div>

      {/* Import price */}
      <div className={styles.formGroup}>
        <label>Giá nhập (₫) <span className={styles.required}>*</span></label>
        <input
          {...register("averageImportPrice", {
            required: "Giá nhập không được để trống",
            min: { value: 0, message: "Giá nhập không được âm" },
          })}
          type="number"
          placeholder="0"
          min="0"
          step="1"
          className={styles.input}
        />
        {errors.averageImportPrice && <p className={styles.error}>{errors.averageImportPrice.message}</p>}
      </div>

      {/* Profit */}
      <div className={styles.formGroup}>
        <label>Lợi nhuận (%) <span className={styles.required}>*</span></label>
        <input
          {...register("profitPercent", {
            required: "Tỷ lệ lợi nhuận không được để trống",
            min: { value: 0, message: "Tỷ lệ lợi nhuận không được âm" },
          })}
          type="number"
          placeholder="10"
          min="0"
          step="1"
          className={styles.input}
        />
        {errors.profitPercent && <p className={styles.error}>{errors.profitPercent.message}</p>}
      </div>

      {/* Selling price */}
      <div className={styles.formGroup}>
        <label>Giá bán (₫)</label>
        <input {...register("sellingPrice")} type="number" disabled className={styles.input} />
        <small>Tự động tính từ giá nhập + lợi nhuận + VAT ({(TAX_RATE * 100).toFixed(1)}%)</small>
      </div>

      {/* Buttons */}
      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={loading}><MdClose /> Hủy</button>
        <button type="submit" disabled={!isValid || loading} className={styles.submitBtn}>{loading ? "Đang lưu..." : "Lưu"}</button>
      </div>
    </form>
  );
}
