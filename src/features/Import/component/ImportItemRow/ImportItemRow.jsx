import React, { useState } from "react";
import stylesRow from "./ImportItemRow.module.css";
import { MdDelete, MdSearch } from "react-icons/md";

export function ImportItemRow({
  index,
  register,
  remove,
  onSearchProduct,
  onSelectProduct,
  searchResults = [],
  loading,
  errors = {},
  categories = [],
  selected = null,
}) {
  const [categorySearch, setCategorySearch] = useState("");
  const [typedProductName, setTypedProductName] = useState("");

  const handleDelete = () => {
    if (window.confirm("Xóa sản phẩm này?")) remove(index);
  };

  const filteredCategories = (categories || []).filter((c) => {
    const name = typeof c === "string" ? c : c?.name || "";
    return name.toLowerCase().includes(categorySearch.toLowerCase());
  });

  return (
    <div className={stylesRow.itemRowCard}>
      {/* Product name */}
      <div className={stylesRow.productSection}>
        <label className={stylesRow.rowLabel}>
          <MdSearch className={stylesRow.labelIcon} /> Tên sản phẩm *
        </label>

        <div className={stylesRow.inputWrapper}>
          <input
            type="text"
            {...register(`items.${index}.productName`, {
              required: "Tên sản phẩm bắt buộc",
              minLength: { value: 2, message: "Tên ít nhất 2 ký tự" },
            })}
            className={`${stylesRow.searchInput} ${errors.productName ? stylesRow.errorInput : ""}`}
            placeholder="Nhập tên sản phẩm..."
            onChange={(e) => {
              const v = e.target.value;
              setTypedProductName(v);
              onSearchProduct(index, v);
            }}
          />

          <input type="hidden" {...register(`items.${index}.productId`)} />

          <div className={stylesRow.productStatus}>
            {selected ? (
              <span className={stylesRow.existing}>Sản phẩm có sẵn</span>
            ) : typedProductName ? (
              <span className={stylesRow.new}>Sản phẩm mới</span>
            ) : null}
          </div>

          {loading ? (
            <div className={stylesRow.dropdown}>
              <div className={stylesRow.spinner}></div>
              <span>Đang tìm...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className={stylesRow.dropdown}>
              {searchResults.map((p) => (
                <li key={p.id} onClick={() => onSelectProduct(index, p)} className={stylesRow.dropdownItem}>
                  <div className={stylesRow.itemName}>{p.name}</div>
                  <div className={stylesRow.itemDetails}>
                    <span className={stylesRow.unit}>{p.unit}</span>
                    •
                    <span className={stylesRow.price}>{p.importPrice?.toLocaleString()}₫</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {errors.productName && <p className={stylesRow.errorMsg}>{errors.productName.message}</p>}
      </div>

      {/* Fields */}
      <div className={stylesRow.fieldsSection}>
        <div className={stylesRow.fieldWrapper}>
          <label className={stylesRow.rowLabel}>📦 Số lượng *</label>
          <input
            type="number"
            {...register(`items.${index}.quantity`, {
              required: "Số lượng bắt buộc",
              min: { value: 1, message: "Số lượng >= 1" },
            })}
            className={stylesRow.numberInput}
            min="1"
          />
          {errors.quantity && <p className={stylesRow.errorMsg}>{errors.quantity.message}</p>}
        </div>

        <div className={stylesRow.fieldWrapper}>
          <label className={stylesRow.rowLabel}>💰 Giá nhập *</label>
          <input
            type="number"
            {...register(`items.${index}.importPrice`, {
              required: "Giá nhập bắt buộc",
              min: { value: 0, message: "Giá >= 0" },
            })}
            className={stylesRow.numberInput}
            min="0"
          />
          {errors.importPrice && <p className={stylesRow.errorMsg}>{errors.importPrice.message}</p>}
        </div>

        <div className={stylesRow.fieldWrapper}>
          <label className={stylesRow.rowLabel}>📊 % Lợi nhuận</label>
          <input
            type="number"
            {...register(`items.${index}.profitPercent`, {
              min: { value: 0, message: "% >= 0" },
              max: { value: 100, message: "% <= 100" },
            })}
            className={stylesRow.numberInput}
            min="0"
            max="100"
          />
        </div>

        <div className={stylesRow.fieldWrapper}>
          <label className={stylesRow.rowLabel}>📏 Đơn vị</label>
          <input
            type="text"
            {...register(`items.${index}.unit`, {
              maxLength: { value: 20, message: "Đơn vị quá dài" },
            })}
            className={stylesRow.textInput}
            maxLength="20"
          />
        </div>

        <div className={stylesRow.fieldWrapper}>
          <label className={stylesRow.rowLabel}>🏷️ Phân loại</label>
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            list={`category-list-${index}`}
            {...register(`items.${index}.category`)}
            className={stylesRow.textInput}
          />
          <datalist id={`category-list-${index}`}>
            {filteredCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className={stylesRow.fieldWrapper}>
          <label className={stylesRow.rowLabel}>📝 Ghi chú</label>
          <input
            type="text"
            {...register(`items.${index}.notes`)}
            className={stylesRow.textInput}
            maxLength="100"
          />
        </div>
      </div>

      <div className={stylesRow.rowActions}>
        <button type="button" onClick={handleDelete} className={stylesRow.deleteBtn}>
          <MdDelete size={20} /> Xóa
        </button>
      </div>
    </div>
  );
}