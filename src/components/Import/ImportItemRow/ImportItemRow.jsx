// components/Import/ImportItemRow.jsx
import React from "react";
import styles from "./ImportItemRow.module.css";
import { MdDelete, MdSearch, MdCheckBox } from "react-icons/md";

export default function ImportItemRow({
  index,
  register,
  remove,
  onSearchProduct,
  onSelectProduct,
  searchResults = [],
  loading,
  errors = {},
}) {
  const handleDelete = () => {
    if (window.confirm("Xóa sản phẩm này?")) {
      remove(index);
    }
  };

  return (
    <div className={styles.itemRowCard}>
      {/* Product Name - Searchable */}
      <div className={styles.productSection}>
        <label className={styles.rowLabel}>
          <MdSearch className={styles.labelIcon} />
          Tên sản phẩm <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            {...register(`items.${index}.productName`, { 
              required: "Tên sản phẩm bắt buộc", 
              minLength: { value: 2, message: "Tên ít nhất 2 ký tự" }
            })}
            className={`${styles.searchInput} ${errors.productName ? styles.errorInput : ""}`}
            placeholder="Nhập tên sản phẩm để tìm..."
            onChange={(e) => onSearchProduct(index, e.target.value)}
          />
          <input type="hidden" {...register(`items.${index}.productId`)} />
          {loading ? (
            <div className={styles.dropdown}>
              <div className={styles.spinner}></div>
              <span>Đang tìm sản phẩm...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className={styles.dropdown}>
              {searchResults.map((p) => (
                <li
                  key={p.id}
                  onClick={() => onSelectProduct(index, p)}
                  className={styles.dropdownItem}
                >
                  <div className={styles.itemName}>{p.name}</div>
                  <div className={styles.itemDetails}>
                    <span className={styles.unit}>{p.unit}</span> • <span className={styles.price}>{p.importPrice?.toLocaleString()}₫</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {errors.productName && <p className={styles.errorMsg}>{errors.productName.message}</p>}
      </div>

      {/* Fields - Vertical Stack */}
      <div className={styles.fieldsSection}>
        <div className={styles.fieldWrapper}>
          <label className={styles.rowLabel}>
            📦 Số lượng <span className={styles.required}>*</span>
          </label>
          <input 
            type="number" 
            {...register(`items.${index}.quantity`, { 
              required: "Số lượng bắt buộc", 
              min: { value: 1, message: "Số lượng >= 1" } 
            })} 
            className={`${styles.numberInput} ${errors.quantity ? styles.errorInput : ""}`} 
            min="1" 
            placeholder="0"
          />
          {errors.quantity && <p className={styles.errorMsg}>{errors.quantity.message}</p>}
        </div>
        <div className={styles.fieldWrapper}>
          <label className={styles.rowLabel}>
            💰 Giá nhập (₫) <span className={styles.required}>*</span>
          </label>
          <input 
            type="number" 
            {...register(`items.${index}.importPrice`, { 
              required: "Giá nhập bắt buộc", 
              min: { value: 0, message: "Giá >= 0" } 
            })} 
            className={`${styles.numberInput} ${errors.importPrice ? styles.errorInput : ""}`} 
            min="0" 
            placeholder="0"
          />
          {errors.importPrice && <p className={styles.errorMsg}>{errors.importPrice.message}</p>}
        </div>
        <div className={styles.fieldWrapper}>
          <label className={styles.rowLabel}>
            📊 % Lợi nhuận
          </label>
          <input 
            type="number" 
            {...register(`items.${index}.profitPercent`, { 
              min: { value: 0, message: "% >= 0" },
              max: { value: 100, message: "% <= 100" }
            })} 
            className={`${styles.numberInput} ${errors.profitPercent ? styles.errorInput : ""}`} 
            min="0" 
            max="100" 
            step="0.01" 
            placeholder="0"
          />
          {errors.profitPercent && <p className={styles.errorMsg}>{errors.profitPercent.message}</p>}
        </div>
        <div className={styles.fieldWrapper}>
          <label className={styles.rowLabel}>
            📏 Đơn vị
          </label>
          <input 
            type="text" 
            {...register(`items.${index}.unit`, { maxLength: { value: 20, message: "Đơn vị quá dài" }})} 
            className={`${styles.textInput} ${errors.unit ? styles.errorInput : ""}`}
            placeholder="VD: Cái, Kg, Hộp..." 
            maxLength="20"
          />
          {errors.unit && <p className={styles.errorMsg}>{errors.unit.message}</p>}
        </div>
      </div>

      {/* Delete */}
      <div className={styles.rowActions}>
        <button type="button" onClick={handleDelete} className={styles.deleteBtn} aria-label="Xóa sản phẩm">
          <MdDelete size={20} />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
}