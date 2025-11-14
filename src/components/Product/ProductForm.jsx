import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import Modal from "../Modal";
import { addCategory } from "../../services/categoryService";
import styles from "./ProductForm.module.css";

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const defaultValues = useMemo(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        sku: initialData.sku || "",
        category: initialData.category || "",
        unit: initialData.unit || "Cái",
        supplier: initialData.supplier || "",
        profitPercent: initialData.profitPercent || "10",
        averageImportPrice: initialData.averageImportPrice || 0,
        sellingPrice: initialData.sellingPrice || 0,
      };
    }
    return {
      name: "",
      sku: "",
      category: "",
      unit: "Cái",
      supplier: "",
      profitPercent: "10",
      averageImportPrice: 0,
      sellingPrice: 0,
    };
  }, [initialData]);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const profitPercent = watch("profitPercent");
  const importPrice = watch("averageImportPrice");

  // Tính giá bán tự động khi importPrice hoặc profitPercent thay đổi
  useEffect(() => {
    const importPriceNum = Number(importPrice) || 0;
    const profitNum = Number(profitPercent) || 10;
    const calculatedPrice = importPriceNum * (1 + profitNum / 100);
    setValue("sellingPrice", calculatedPrice > 0 ? calculatedPrice.toFixed(0) : 0);
  }, [importPrice, profitPercent, setValue]);

  // Reset form khi initialData thay đổi
  useEffect(() => {
    reset(defaultValues);
  }, [initialData, reset, defaultValues]);

  const [newCategory, setNewCategory] = useState("");
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(categories || []);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Lọc danh sách phân loại theo từng ký tự nhập
  useEffect(() => {
    if (categorySearch.trim()) {
      const filtered = (categories || []).filter((cat) =>
        cat.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories || []);
    }
  }, [categorySearch, categories]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) {
      alert("Tên phân loại không được để trống");
      return;
    }
    try {
      setIsAddingCategory(true);
      const newCat = {
        name: newCategory.trim(),
        description: "",
      };
      await addCategory(newCat);
      setValue("category", newCategory);
      setShowNewCatModal(false);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Lỗi khi thêm phân loại");
    } finally {
      setIsAddingCategory(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        {/* Tên sản phẩm */}
        <div className={styles.formGroup}>
          <label>Tên sản phẩm <span className={styles.required}>*</span></label>
          <input
            {...register("name", { required: "Tên sản phẩm không được để trống" })}
            type="text"
            placeholder="Nhập tên sản phẩm"
            className={styles.input}
          />
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}
        </div>

        {/* SKU */}
        <div className={styles.formGroup}>
          <label>SKU</label>
          <input
            {...register("sku")}
            type="text"
            placeholder="SKU (tự động sinh nếu trống)"
            className={styles.input}
            disabled
          />
        </div>

        {/* Phân loại */}
        <div className={styles.formGroup}>
          <label>Phân loại</label>
          <div className={styles.categoryWrapper}>
            <div className={styles.categorySearch}>
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Tìm kiếm phân loại..."
                className={styles.searchInput}
              />
              {categorySearch && (
                <div className={styles.searchResults}>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div
                        key={cat}
                        className={styles.searchResultItem}
                        onClick={() => {
                          setValue("category", cat);
                          setCategorySearch("");
                        }}
                      >
                        {cat}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noResults}>
                      Không tìm thấy phân loại
                    </div>
                  )}
                </div>
              )}
            </div>
            <select {...register("category")} className={styles.select}>
              <option value="">-- Chọn phân loại --</option>
              {filteredCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewCatModal(true)}
              className={styles.addCategoryBtn}
              title="Thêm phân loại mới"
            >
              +
            </button>
          </div>
        </div>

        {/* Đơn vị */}
        <div className={styles.formGroup}>
          <label>Đơn vị</label>
          <select {...register("unit")} className={styles.select}>
            <option value="Cái">Cái</option>
            <option value="Chiếc">Chiếc</option>
            <option value="Bộ">Bộ</option>
            <option value="Hộp">Hộp</option>
            <option value="Lốc">Lốc</option>
            <option value="Bao">Bao</option>
          </select>
        </div>

        {/* Nhà cung cấp */}
        <div className={styles.formGroup}>
          <label>Nhà cung cấp</label>
          <input
            {...register("supplier")}
            type="text"
            placeholder="Tên nhà cung cấp (tùy chọn)"
            className={styles.input}
          />
        </div>

        {/* Giá nhập */}
        <div className={styles.formGroup}>
          <label>Giá nhập (₫) <span className={styles.required}>*</span></label>
          <input
            {...register("averageImportPrice", { required: "Giá nhập không được để trống", min: 0 })}
            type="number"
            placeholder="0"
            className={styles.input}
          />
          {errors.averageImportPrice && <p className={styles.error}>{errors.averageImportPrice.message}</p>}
        </div>

        {/* Tỷ lệ lợi nhuận */}
        <div className={styles.formGroup}>
          <label>Tỷ lệ lợi nhuận (%)</label>
          <input
            {...register("profitPercent")}
            type="number"
            placeholder="10"
            className={styles.input}
          />
        </div>

        {/* Giá bán */}
        <div className={styles.formGroup}>
          <label>Giá bán (₫)</label>
          <input
            {...register("sellingPrice")}
            type="number"
            placeholder="0"
            className={styles.input}
            disabled
          />
          <small>Tính tự động từ giá nhập + lợi nhuận</small>
        </div>

        {/* Buttons */}
        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={loading}>
            <MdClose /> Hủy
          </button>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>

      {/* Modal thêm phân loại mới */}
      <Modal isOpen={showNewCatModal} onClose={() => setShowNewCatModal(false)} title="Thêm phân loại mới">
        <div className={styles.newCategoryForm}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nhập tên phân loại mới"
            className={styles.input}
            disabled={isAddingCategory}
          />
          <div className={styles.formActions}>
            <button 
              onClick={() => setShowNewCatModal(false)} 
              className={styles.cancelBtn}
              disabled={isAddingCategory}
            >
              Hủy
            </button>
            <button 
              onClick={handleAddNewCategory} 
              className={styles.submitBtn}
              disabled={isAddingCategory}
            >
              {isAddingCategory ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
