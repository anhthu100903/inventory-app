import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import SupplierSelect from "../components/Import/SupplierSelect";
import ImportItemTable from "../components/Import/ImportItemTable";
import { handleImport } from "../services/importService";

export default function Imports() {
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const { control, handleSubmit, register, reset, setValue } = useForm({
    defaultValues: {
      note: "",
      items: [
        {
          productName: "",
          quantity: 0,
          importPrice: 0,
          unit: "Cái",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = async (data) => {
    if (!selectedSupplier) {
      alert("Vui lòng chọn nhà cung cấp");
      return;
    }

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.importPrice,
      0
    );

    const importDoc = {
      supplierId: selectedSupplier.id,
      items: data.items,
      totalAmount,
      note: data.note,
      importDate: new Date(),
    };

    const result = await handleImport(importDoc);
    if (result.success) {
      alert("✅ Nhập hàng thành công!");
      reset();
      setSelectedSupplier(null);
    } else {
      alert("❌ Lỗi khi lưu dữ liệu: " + result.error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📦 Nhập hàng</h2>

      <SupplierSelect onSelect={setSelectedSupplier} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <ImportItemTable
          fields={fields}
          register={register}
          append={append}
          remove={remove}
          setValue={setValue}
        />

        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-1">Ghi chú</label>
          <textarea
            {...register("note")}
            className="border p-2 rounded w-full"
            placeholder="Ghi chú phiếu nhập..."
          />
        </div>

        <button
          type="submit"
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Lưu phiếu nhập
        </button>
      </form>
    </div>
  );
}
