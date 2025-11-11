export default function ImportItemRow({
  index,
  register,
  remove,
  onSearchProduct,
  onSelectProduct,
  searchResults = [],
  loading,
}) {
  return (
    <tr>
      <td className="border px-2 py-1 relative">
        <input
          type="text"
          {...register(`items.${index}.productName`)}
          className="border p-1 rounded w-full"
          placeholder="Nhập tên sản phẩm..."
          onChange={(e) => onSearchProduct(index, e.target.value)}
        />
        
        {/* ⭐ THÊM TRƯỜNG ẨN CHO ID ⭐ */}
        <input
            type="hidden"
            {...register(`items.${index}.productId`)} 
        />

        {/* Dropdown gợi ý sản phẩm */}
        {loading ? (
          <div className="absolute bg-white border p-2 text-sm w-full shadow">Đang tìm...</div>
        ) : (
          searchResults.length > 0 && (
            <ul className="absolute bg-white border mt-1 w-full z-10 rounded shadow">
              {searchResults.map((p) => (
                <li
                  key={p.id}
                  onClick={() => onSelectProduct(index, p)}
                  className="px-2 py-1 hover:bg-gray-200 cursor-pointer text-sm"
                >
                  {p.name} — {p.unit} ({p.importPrice?.toLocaleString()}₫)
                </li>
              ))}
            </ul>
          )
        )}
      </td>

      <td className="border px-2 py-1">
        <input type="number" {...register(`items.${index}.quantity`)} className="border p-1 w-full" />
      </td>

      <td className="border px-2 py-1">
        <input type="number" {...register(`items.${index}.importPrice`)} className="border p-1 w-full" />
      </td>

      <td className="border px-2 py-1">
        <input type="number" {...register(`items.${index}.profitPercent`)} className="border p-1 w-full" />
      </td>

      <td className="border px-2 py-1">
        <input type="text" {...register(`items.${index}.unit`)} className="border p-1 w-full" />
      </td>

      <td className="border px-2 py-1 text-center">
        <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
          ❌
        </button>
      </td>
    </tr>
  );
}
