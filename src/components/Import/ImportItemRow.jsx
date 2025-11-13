// components/Import/ImportItemRow.jsx
import React from "react";
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
    <div className="itemRowCard">
      {/* Product Name - Searchable */}
      <div className="productSection">
        <label className="rowLabel">
          <MdSearch className="labelIcon" />
          Tên sản phẩm <span className="required">*</span>
        </label>
        <div className="inputWrapper">
          <input
            type="text"
            {...register(`items.${index}.productName`, { 
              required: "Tên sản phẩm bắt buộc", 
              minLength: { value: 2, message: "Tên ít nhất 2 ký tự" }
            })}
            className={`searchInput ${errors.productName ? "errorInput" : ""}`}
            placeholder="Nhập tên sản phẩm để tìm..."
            onChange={(e) => onSearchProduct(index, e.target.value)}
          />
          <input type="hidden" {...register(`items.${index}.productId`)} />
          {loading ? (
            <div className="dropdown">
              <div className="spinner"></div>
              <span>Đang tìm sản phẩm...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="dropdown">
              {searchResults.map((p) => (
                <li
                  key={p.id}
                  onClick={() => onSelectProduct(index, p)}
                  className="dropdownItem"
                >
                  <div className="itemName">{p.name}</div>
                  <div className="itemDetails">
                    <span className="unit">{p.unit}</span> • <span className="price">{p.importPrice?.toLocaleString()}₫</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {errors.productName && <p className="errorMsg">{errors.productName.message}</p>}
      </div>

      {/* Fields Grid */}
      <div className="fieldsGrid">
        <div className="fieldWrapper">
          <label className="rowLabel">
            📦 Số lượng <span className="required">*</span>
          </label>
          <input 
            type="number" 
            {...register(`items.${index}.quantity`, { 
              required: "Số lượng bắt buộc", 
              min: { value: 1, message: "Số lượng >= 1" } 
            })} 
            className={`numberInput ${errors.quantity ? "errorInput" : ""}`} 
            min="1" 
            placeholder="0"
          />
          {errors.quantity && <p className="errorMsg">{errors.quantity.message}</p>}
        </div>
        <div className="fieldWrapper">
          <label className="rowLabel">
            💰 Giá nhập (₫) <span className="required">*</span>
          </label>
          <input 
            type="number" 
            {...register(`items.${index}.importPrice`, { 
              required: "Giá nhập bắt buộc", 
              min: { value: 0, message: "Giá >= 0" } 
            })} 
            className={`numberInput ${errors.importPrice ? "errorInput" : ""}`} 
            min="0" 
            placeholder="0"
          />
          {errors.importPrice && <p className="errorMsg">{errors.importPrice.message}</p>}
        </div>
        <div className="fieldWrapper">
          <label className="rowLabel">
            📊 % Lợi nhuận
          </label>
          <input 
            type="number" 
            {...register(`items.${index}.profitPercent`, { 
              min: { value: 0, message: "% >= 0" },
              max: { value: 100, message: "% <= 100" }
            })} 
            className={`numberInput ${errors.profitPercent ? "errorInput" : ""}`} 
            min="0" 
            max="100" 
            step="0.01" 
            placeholder="0"
          />
          {errors.profitPercent && <p className="errorMsg">{errors.profitPercent.message}</p>}
        </div>
        <div className="fieldWrapper">
          <label className="rowLabel">
            📏 Đơn vị
          </label>
          <input 
            type="text" 
            {...register(`items.${index}.unit`, { maxLength: { value: 20, message: "Đơn vị quá dài" }})} 
            className={`textInput ${errors.unit ? "errorInput" : ""}`} 
            placeholder="VD: Cái, Kg, Hộp..." 
            maxLength="20"
          />
          {errors.unit && <p className="errorMsg">{errors.unit.message}</p>}
        </div>
      </div>

      {/* Delete */}
      <div className="rowActions">
        <button type="button" onClick={handleDelete} className="deleteBtn" aria-label="Xóa sản phẩm">
          <MdDelete size={20} />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
}