import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import Modal from "../Modal";
import { addCategory } from "../../services/categoryService";
import { getAllSuppliers, addSupplier } from "../../services/supplierService";
import styles from "./ProductForm.module.css";

const TAX_RATE = Number(import.meta.env.VITE_TAX_RATE || 0);

// Helper function to capitalize first letter (except specific units like m, cm, mm, etc.)
const capitalizeText = (text) => {
  if (!text) return text;
  const lowercaseUnits = ["m", "cm", "mm", "km", "g", "kg", "l", "ml"];
  if (lowercaseUnits.includes(text.toLowerCase())) {
    return text.toLowerCase();
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(
    initialData?.supplier || null
  );
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  // Load suppliers on mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const loaded = await getAllSuppliers();
        setSuppliers(loaded);
        setFilteredSuppliers(loaded);

        // If editing, set the current supplier
        if (initialData?.supplier) {
          const current = loaded.find((s) => s.name === initialData.supplier);
          if (current) {
            setSelectedSupplier(current);
          }
        }
      } catch (err) {
        console.error("Failed to load suppliers:", err);
      }
    };
    loadSuppliers();
  }, [initialData]);

  // Filter suppliers by search
  useEffect(() => {
    if (supplierSearch.trim()) {
      const filtered = suppliers.filter((s) =>
        s.name.toLowerCase().includes(supplierSearch.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [supplierSearch, suppliers]);

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      alert("Tên nhà cung cấp không được để trống");
      return;
    }
    try {
      setIsAddingSupplier(true);
      const newSupplier = await addSupplier({
        name: newSupplierName.trim(),
        email: "",
        phone: "",
        address: "",
        note: "",
      });
      setSelectedSupplier(newSupplier);
      setSuppliers([...suppliers, newSupplier]);
      setShowSupplierModal(false);
      setNewSupplierName("");
    } catch (err) {
      console.error("Failed to add supplier:", err);
      alert("Lỗi khi thêm nhà cung cấp");
    } finally {
      setIsAddingSupplier(false);
    }
  };

  const defaultValues = useMemo(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        sku: initialData.sku || "",
        category: initialData.category || "",
        unit: initialData.unit || "",
        totalInStock: initialData.totalInStock || 0,
        profitPercent: initialData.profitPercent || "10",
        averageImportPrice: initialData.averageImportPrice || 0,
        sellingPrice: initialData.sellingPrice || 0,
      };
    }
    return {
      name: "",
      sku: "",
      category: "",
      unit: "",
      totalInStock: 0,
      profitPercent: "10",
      averageImportPrice: 0,
      sellingPrice: 0,
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const profitPercent = watch("profitPercent");
  const importPrice = watch("averageImportPrice");

  // Tính giá bán tự động khi importPrice hoặc profitPercent thay đổi (với VAT)
  useEffect(() => {
    console.log(TAX_RATE)
    const importPriceNum = Number(importPrice) || 0;
    const profitNum = Number(profitPercent) || 10;
    const base = importPriceNum * (1 + profitNum / 100);
    const calculatedPrice = base * (1 + TAX_RATE);

    setValue(
      "sellingPrice",
      calculatedPrice > 0 ? calculatedPrice.toFixed(0) : 0
    );
  }, [importPrice, profitPercent, setValue]);

  // Reset form khi initialData thay đổi
  useEffect(() => {
    reset(defaultValues);
  }, [initialData, reset, defaultValues]);

  const [newCategory, setNewCategory] = useState("");
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(
    categories || []
  );
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
    // react-hook-form validations are used for required inputs.
    // Category is optional by requirement.
    const submitData = {
      ...data,
      name: capitalizeText(data.name),
      unit: capitalizeText(data.unit),
      supplier: selectedSupplier?.name || "",
      totalInStock: Number(data.totalInStock || 0),
    };
    onSubmit(submitData);
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) {
      alert("Tên phân loại không được để trống");
      return;
    }
    try {
      setIsAddingCategory(true);
      const newCat = {
        name: capitalizeText(newCategory.trim()),
        description: "",
      };
      await addCategory(newCat);
      // Immediately add to local filtered categories so the new category is selectable
      setFilteredCategories((prev) => [newCat.name, ...(prev || [])]);
      setValue("category", newCat.name);
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
          <label>
            Tên sản phẩm <span className={styles.required}>*</span>
          </label>
          <input
            {...register("name", {
              required: "Tên sản phẩm không được để trống",
            })}
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
          <label>
            Đơn vị <span className={styles.required}>*</span>
          </label>
          <input
            {...register("unit", { required: "Đơn vị không được để trống" })}
            type="text"
            placeholder="vd: Cái, Chiếc, Bộ, Hộp, Lốc, Bao..."
            className={styles.input}
          />
          {errors.unit && <p className={styles.error}>{errors.unit.message}</p>}
        </div>

        {/* Số lượng tồn kho ban đầu */}
        <div className={styles.formGroup}>
          <label>Số lượng tồn kho ban đầu</label>
          <input
            {...register("totalInStock")}
            type="number"
            min="0"
            step="1"
            placeholder="0"
            className={styles.input}
          />
        </div>

        {/* Nhà cung cấp */}
        <div className={styles.formGroup}>
          <label>Nhà cung cấp</label>
          <div className={styles.supplierWrapper}>
            <div className={styles.supplierSearch}>
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="Tìm kiếm nhà cung cấp..."
                className={styles.searchInput}
              />
              {supplierSearch && (
                <div className={styles.searchResults}>
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((sup) => (
                      <div
                        key={sup.id}
                        className={styles.searchResultItem}
                        onClick={() => {
                          setSelectedSupplier(sup);
                          setSupplierSearch("");
                        }}
                      >
                        {sup.name}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noResults}>
                      Không tìm thấy nhà cung cấp
                    </div>
                  )}
                </div>
              )}
            </div>
            <select
              value={selectedSupplier?.id || ""}
              onChange={(e) => {
                const sup = suppliers.find((s) => s.id === e.target.value);
                setSelectedSupplier(sup || null);
              }}
              className={styles.select}
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowSupplierModal(true)}
              className={styles.addCategoryBtn}
              title="Thêm nhà cung cấp mới"
            >
              +
            </button>
          </div>
          {selectedSupplier && (
            <small style={{ color: "#666", marginTop: "5px" }}>
              Đã chọn: {selectedSupplier.name}
            </small>
          )}
        </div>

        {/* Giá nhập */}
        <div className={styles.formGroup}>
          <label>
            Giá nhập (₫) <span className={styles.required}>*</span>
          </label>
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
          {errors.averageImportPrice && (
            <p className={styles.error}>{errors.averageImportPrice.message}</p>
          )}
        </div>

        {/* Tỷ lệ lợi nhuận */}
        <div className={styles.formGroup}>
          <label>
            Tỷ lệ lợi nhuận (%) <span className={styles.required}>*</span>
          </label>
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
          {errors.profitPercent && (
            <p className={styles.error}>{errors.profitPercent.message}</p>
          )}
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
          <small>
            Tính tự động từ giá nhập cao nhất + lợi nhuận + VAT (
            {(TAX_RATE * 100).toFixed(1)}%)
          </small>
        </div>

        {/* Buttons */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelBtn}
            disabled={loading}
          >
            <MdClose /> Hủy
          </button>
          <button
            type="submit"
            disabled={!isValid || loading}
            className={styles.submitBtn}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>

      {/* Modal thêm phân loại mới */}
      <Modal
        isOpen={showNewCatModal}
        onClose={() => setShowNewCatModal(false)}
        title="Thêm phân loại mới"
      >
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

      {/* Modal thêm nhà cung cấp mới */}
      <Modal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title="Thêm nhà cung cấp mới"
      >
        <div className={styles.newCategoryForm}>
          <input
            type="text"
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
            placeholder="Nhập tên nhà cung cấp mới"
            className={styles.input}
            disabled={isAddingSupplier}
          />
          <div className={styles.formActions}>
            <button
              onClick={() => setShowSupplierModal(false)}
              className={styles.cancelBtn}
              disabled={isAddingSupplier}
            >
              Hủy
            </button>
            <button
              onClick={handleAddSupplier}
              className={styles.submitBtn}
              disabled={isAddingSupplier}
            >
              {isAddingSupplier ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
