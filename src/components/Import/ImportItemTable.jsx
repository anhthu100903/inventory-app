// components/Import/ImportItemTable.jsx - Add borders between rows
import React from "react";
import ImportItemRow from "./ImportItemRow";
import { MdPlaylistAddCheck, MdAdd } from "react-icons/md";
import { findProductsByName } from "../../services/productService";
import styles from "./ImportItemTable.module.css";

export default function ImportItemTable({ fields, register, append, remove, setValue, errors, className = "" }) {
  const [searchResults, setSearchResults] = React.useState({});
  const [loadingIndex, setLoadingIndex] = React.useState(null);

  const handleSearchProduct = async (index, name) => {
    if (!name || name.length < 2) {
      setSearchResults((prev) => ({ ...prev, [index]: [] }));
      return;
    }
    setLoadingIndex(index);
    try {
      const products = await findProductsByName(name);
      setSearchResults((prev) => ({ ...prev, [index]: products }));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoadingIndex(null);
    }
  };

  const handleSelectProduct = (index, product) => {
    setValue(`items.${index}.productId`, product.id);
    setValue(`items.${index}.productName`, product.name);
    setValue(`items.${index}.importPrice`, product.importPrice || 0);
    setValue(`items.${index}.profitPercent`, product.profitPercent || 10);
    setValue(`items.${index}.unit`, product.unit || "Cái");
    setSearchResults((prev) => ({ ...prev, [index]: [] }));
  };

  return (
    <div className={`${styles.itemsTableContainer} ${className}`}>
      <div className={styles.tableHeader}>
        <MdPlaylistAddCheck className={styles.headerIcon} />
        <h4 className={styles.headerTitle}>Danh sách sản phẩm nhập</h4>
        {errors && errors.type === "required" && <p className={styles.errorMsg}>Ít nhất 1 sản phẩm</p>}
      </div>

      <div className={styles.itemsList}>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.rowSeparator}>
            <ImportItemRow
              index={index}
              register={register}
              remove={remove}
              onSearchProduct={handleSearchProduct}
              searchResults={searchResults[index] || []}
              onSelectProduct={handleSelectProduct}
              loading={loadingIndex === index}
              errors={errors?.[index] || {}} // Pass per-row errors
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          append({
            productName: "",
            quantity: 0,
            importPrice: 0,
            profitPercent: 20,
            unit: "Cái",
          })
        }
        className={styles.addItemBtn}
        disabled={loadingIndex !== null}
      >
        <MdAdd size={20} className={styles.addIcon} />
        <span className={styles.addText}>Thêm sản phẩm mới</span>
      </button>
    </div>
  );
}