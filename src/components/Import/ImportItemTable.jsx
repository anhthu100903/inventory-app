import ImportItemRow from "./ImportItemRow";
import { findProductsByName } from "../../services/productService";
import { useState } from "react";

export default function ImportItemTable({ fields, register, append, remove, setValue }) {
  const [searchResults, setSearchResults] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);

  // Hàm tìm sản phẩm khi nhập tên
  const handleSearchProduct = async (index, name) => {
    if (!name || name.length < 2) {
      setSearchResults((prev) => ({ ...prev, [index]: [] }));
      return;
    }
    setLoadingIndex(index);
    const products = await findProductsByName(name);
    setSearchResults((prev) => ({ ...prev, [index]: products }));
    setLoadingIndex(null);
  };

  // Khi chọn sản phẩm có sẵn
  const handleSelectProduct = (index, product) => {
    setValue(`items.${index}.productId`, product.id);
    setValue(`items.${index}.productName`, product.name);
    setValue(`items.${index}.importPrice`, product.importPrice || 0);
    setValue(`items.${index}.profitPercent`, product.profitPercent || 10);
    setValue(`items.${index}.unit`, product.unit || "Cái");
    setSearchResults((prev) => ({ ...prev, [index]: [] })); // ẩn danh sách gợi ý
  };


  return (
    <div className="mt-4">
      <h4 className="text-lg font-medium mb-2">Danh sách sản phẩm nhập</h4>

      <table className="table-auto w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Tên sản phẩm</th>
            <th className="border px-2 py-1">Số lượng</th>
            <th className="border px-2 py-1">Giá nhập</th>
            <th className="border px-2 py-1">% Lợi nhuận</th>
            <th className="border px-2 py-1">Đơn vị</th>
            <th className="border px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <ImportItemRow
              key={field.id}
              index={index}
              register={register}
              remove={remove}
              onSearchProduct={handleSearchProduct}
              searchResults={searchResults[index] || []}
              onSelectProduct={handleSelectProduct}
              loading={loadingIndex === index}
            />
          ))}
        </tbody>
      </table>

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
        className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
      >
        ➕ Thêm sản phẩm
      </button>
    </div>
  );
}
