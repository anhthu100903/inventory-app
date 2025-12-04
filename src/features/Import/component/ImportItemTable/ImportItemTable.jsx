import React from "react";
import { searchProductsByNameWithFallback, getAllCategories } from "@services/productService";
import { getAllCategories as fetchCategories } from "@services/categoryService";
import { ImportItemRow } from "@features/Import/component/ImportItemRow/ImportItemRow.jsx";
import stylesTable from "./ImportItemTable.module.css";

export function ImportItemTable({ fields, register, append, remove, setValue, errors }) {
  const [searchResults, setSearchResults] = React.useState({});
  const [loadingIndex, setLoadingIndex] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [selectedProducts, setSelectedProducts] = React.useState({});

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const cats = await fetchCategories();
        if (!mounted) return;
        const names = cats.map((c) => (typeof c === "string" ? c : c.name || ""));
        setCategories(names.filter(Boolean));
      // eslint-disable-next-line no-unused-vars
      } catch (_) {
        try {
          const cats2 = await getAllCategories();
          if (!mounted) return;
          setCategories(cats2 || []);
        } catch (e) {
          console.error("Load categories failed", e);
        }
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  const handleSearchProduct = async (index, name) => {
    setSelectedProducts((prev) => ({ ...prev, [index]: null }));

    if (!name || name.length < 2) {
      setSearchResults((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    setLoadingIndex(index);
    try {
      const results = await searchProductsByNameWithFallback(name);
      setSearchResults((prev) => ({ ...prev, [index]: results }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIndex(null);
    }
  };

  const handleSelectProduct = (index, product) => {
    setValue(`items.${index}.productId`, product.id);
    setValue(`items.${index}.productName`, product.name);
    setValue(`items.${index}.importPrice`, product.importPrice || 0);
    setValue(`items.${index}.profitPercent`, product.profitPercent || 10);
    setSelectedProducts((prev) => ({ ...prev, [index]: product }));
  };

  return (
    <div className={stylesTable.tableWrapper}>
      {fields.map((_, index) => (
        <ImportItemRow
          key={index}
          index={index}
          register={register}
          remove={remove}
          searchResults={searchResults[index] || []}
          loading={loadingIndex === index}
          onSearchProduct={handleSearchProduct}
          onSelectProduct={handleSelectProduct}
          categories={categories}
          selected={selectedProducts[index]}
          errors={errors?.[index] || {}}
        />
      ))}

      <button type="button" className={stylesTable.addRowBtn} onClick={append}>
        + Thêm sản phẩm
      </button>
    </div>
  );
}
