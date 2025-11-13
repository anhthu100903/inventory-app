// components/Import/ImportForm.jsx
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { MdCalendarToday, MdBusiness, MdNoteAdd, MdCalculate, MdAddCircle, MdCheckCircle, MdClose } from "react-icons/md";
import Modal from "../Modal";
import SupplierForm from "../Supplier/SupplierForm";
import SupplierSelect from "./SupplierSelect";
import ImportItemTable from "./ImportItemTable";
import styles from "./ImportForm.module.css";

export default function ImportForm({ initialData, onSubmit, onCancel, loading = false }) {
  const { control, handleSubmit, register, formState: { errors }, reset, setValue } = useForm({
    defaultValues: initialData || {
      importDate: new Date().toISOString().slice(0, 7),
      note: "",
      items: [{ productName: "", quantity: 0, importPrice: 0, profitPercent: 20, unit: "Cái" }],
      totalAmount: 0,
    },
    mode: "onChange",
  });

  const watchedItems = useWatch({ control, name: "items" }) || [];
  const totalAmount = watchedItems.reduce((sum, item) => sum + (item?.quantity || 0) * (item?.importPrice || 0), 0);

  const [selectedSupplier, setSelectedSupplier] = React.useState(initialData?.supplier || null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: "", email: "", phone: "", address: "", note: "" });
  const [editingSupplierId, setEditingSupplierId] = useState(null);

  const handleLocalSubmit = (data) => {
    if (!selectedSupplier || watchedItems.length === 0) return;
    onSubmit({ ...data, supplier: selectedSupplier, totalAmount });
  };

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSelectedSupplier(initialData.supplier);
    }
  }, [initialData, reset]);

  const isSubmitDisabled = !selectedSupplier || watchedItems.length === 0 || loading;

  const handleOpenSupplierModal = (suggestedName = "") => {
    setSupplierForm({ name: suggestedName, email: "", phone: "", address: "", note: "" });
    setEditingSupplierId(null);
    setShowSupplierModal(true);
  };

  const handleSupplierSubmit = async (supplierData) => {
    // Logic Firebase add/update supplier
    setSelectedSupplier(supplierData);
    setShowSupplierModal(false);
  };

  const handleSupplierCancel = () => {
    setShowSupplierModal(false);
    setEditingSupplierId(null);
  };

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className={styles.importForm}>
      {/* Date Section - Card style */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <MdCalendarToday className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>Thông tin chung</h3>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Tháng nhập <span className={styles.required}>*</span>
          </label>
          <input
            type="month"
            {...register("importDate", { required: "Chọn tháng nhập" })}
            className={`${styles.formInput} ${errors.importDate ? styles.errorInput : ""}`}
            min={new Date().toISOString().slice(0, 7)}
          />
          {errors.importDate && <p className={styles.errorMsg}>{errors.importDate.message}</p>}
        </div>
      </div>

      {/* Supplier Section - Card style */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <MdBusiness className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>Nhà cung cấp <span className={styles.required}>*</span></h3>
        </div>
        <div className={styles.formGroup}>
          <SupplierSelect 
            onSelect={setSelectedSupplier} 
            value={selectedSupplier}
            error={errors.supplier?.message}
            className={styles.supplierSelect}
            onOpenSupplierModal={handleOpenSupplierModal}
          />
        </div>
      </div>

      {/* Items Section - Card style, tạm ẩn */}
      {!showSupplierModal && (
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <MdNoteAdd className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Sản phẩm nhập <span className={styles.required}>*</span></h3>
          </div>
          <div className={styles.formGroup}>
            <ImportItemTable
              fields={watchedItems}
              register={register}
              append={() => setValue("items", [...watchedItems, { productName: "", quantity: 0, importPrice: 0, profitPercent: 20, unit: "Cái" }])}
              remove={(index) => setValue("items", watchedItems.filter((_, i) => i !== index))}
              setValue={setValue}
              errors={errors.items}
              className={styles.itemTable}
            />
            {errors.items && <p className={styles.errorMsg}>{errors.items.message || "Ít nhất 1 sản phẩm hợp lệ"}</p>}
          </div>
        </div>
      )}

      {/* Spacer - Giữ nguyên để chiều cao ổn định */}
      {showSupplierModal && <div className={styles.heightSpacer}></div>}

      {/* Total Section - Card style, tạm ẩn */}
      {!showSupplierModal && (
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <MdCalculate className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Tổng kết</h3>
          </div>
          <div className={styles.totalSection}>
            <strong className={styles.totalText}>Tổng tiền: {totalAmount.toLocaleString('vi-VN')} ₫</strong>
          </div>
        </div>
      )}

      {/* Note Section - Card style */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <MdNoteAdd className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>Ghi chú</h3>
        </div>
        <div className={styles.formGroup}>
          <textarea
            {...register("note", { maxLength: { value: 500, message: "Ghi chú quá dài (tùy chọn 500 ký tự)" } })}
            rows={3}
            className={`${styles.formInput} ${styles.formTextarea} ${errors.note ? styles.errorInput : ""}`}
            placeholder="Ghi chú thêm về phiếu nhập (tùy chọn)..."
          />
          {errors.note && <p className={styles.errorMsg}>{errors.note.message}</p>}
        </div>
      </div>

      {/* Actions - Tạm ẩn */}
      {!showSupplierModal && (
        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={loading}>
            <MdClose size={18} />
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`${styles.submitBtn} ${loading ? styles.loadingBtn : ""}`}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Đang lưu...
              </>
            ) : initialData ? (
              <>
                <MdCheckCircle size={20} />
                Cập nhật
              </>
            ) : (
              <>
                <MdAddCircle size={20} />
                Thêm mới
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal SupplierForm - Giữ nguyên */}
      <Modal
        isOpen={showSupplierModal}
        onClose={handleSupplierCancel}
        title={editingSupplierId ? "✏️ Cập nhật Nhà Cung Cấp" : "➕ Thêm Nhà Cung Cấp Mới"}
      >
        <SupplierForm
          form={supplierForm}
          editingId={editingSupplierId}
          onChange={(e) => setSupplierForm({ ...supplierForm, [e.target.name]: e.target.value })}
          onSubmit={handleSupplierSubmit}
          onCancel={handleSupplierCancel}
        />
      </Modal>
    </form>
  );
}