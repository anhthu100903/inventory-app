import React, { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
    MdCalendarToday,
    MdBusiness,
    MdNoteAdd,
    MdCalculate,
    MdClose
} from "react-icons/md";

import Modal from "@components/Modal";
import SupplierForm from "@features/Supplier/components/SupplierForm/SupplierForm";
import SupplierSelect from "@features/Import/component/SupplierSelect/SupplierSelect";
import { formatDateToISO } from "@shared/utils/dateUtils";
import {
    addSupplier as addSupplierService,
    updateSupplier as updateSupplierService,
} from "@services/supplierService";
import { ImportItemTable } from "@features/Import/component/ImportItemTable/ImportItemTable";
import stylesForm from "./ImportForm.module.css";

export default function ImportForm({ initialData, onSubmit, onCancel, loading = false }) {
    const defaultFormValues = useMemo(() => {
        const dateValue = initialData?.importDate
            ? formatDateToISO(initialData.importDate)
            : new Date().toISOString().slice(0, 10);

        return initialData
            ? { ...initialData, importDate: dateValue }
            : {
                  importDate: dateValue,
                  note: "",
                  items: [{ productName: "", quantity: 0, importPrice: 0, profitPercent: 20, unit: "Cái" }],
                  totalAmount: 0,
              };
    }, [initialData]);

    const { control, handleSubmit, register, formState: { errors }, reset, setValue } = useForm({
        defaultValues: defaultFormValues,
        mode: "onChange",
    });

    const watchedItems = useWatch({ control, name: "items" }) || [];
    const totalAmount = watchedItems.reduce((s, it) => s + (it.quantity || 0) * (it.importPrice || 0), 0);

    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [supplierForm, setSupplierForm] = useState({ name: "", email: "", phone: "", address: "", note: "" });
    const [editingSupplierId] = useState(null);
    const [supplierReloadKey, setSupplierReloadKey] = useState(0);

    useEffect(() => {
        reset(defaultFormValues);
        setSelectedSupplier(initialData?.supplier || null);
    }, [initialData, reset, defaultFormValues]);

    useEffect(() => {
        setValue("totalAmount", totalAmount);
    }, [totalAmount, setValue]);

    const handleLocalSubmit = (data) => {
        if (!selectedSupplier || watchedItems.length === 0) {
            alert("Vui lòng chọn nhà cung cấp và thêm ít nhất một sản phẩm.");
            return;
        }

        const supplierPlain = selectedSupplier?.toPlainObject
            ? selectedSupplier.toPlainObject()
            : selectedSupplier;

        onSubmit({
            ...data,
            importDate: data.importDate ? new Date(data.importDate) : new Date(),
            supplier: supplierPlain,
            items: watchedItems,
            totalAmount,
        });
    };

    const handleSupplierSubmit = async (supplierData) => {
        try {
            const saved = editingSupplierId
                ? await updateSupplierService(editingSupplierId, supplierData)
                : await addSupplierService(supplierData);

            setSelectedSupplier(saved);
            setShowSupplierModal(false);
            setSupplierReloadKey((k) => k + 1);
        } catch (err) {
            alert("Lỗi khi lưu nhà cung cấp: " + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleLocalSubmit)} className={stylesForm.importForm}>
            {/* date */}
            <div className={stylesForm.sectionCard}>
                <div className={stylesForm.sectionHeader}>
                    <MdCalendarToday className={stylesForm.sectionIcon} />
                    <h3 className={stylesForm.sectionTitle}>Ngày nhập hàng</h3>
                </div>
                <div className={stylesForm.formGroup}>
                    <input
                        {...register("importDate", { required: "Chọn ngày nhập" })}
                        className={stylesForm.formInput}
                        max={new Date().toISOString().split("T")[0]}
                    />
                    {errors.importDate && <p className={stylesForm.errorMessage}>{errors.importDate.message}</p>}
                </div>
            </div>

            {/* Supplier */}
            <div className={stylesForm.sectionCard}>
                <div className={stylesForm.sectionHeader}>
                    <MdBusiness className={stylesForm.sectionIcon} />
                    <h3 className={stylesForm.sectionTitle}>Nhà cung cấp *</h3>
                </div>
                <div className={stylesForm.formGroup}>
                    <SupplierSelect
                        onSelect={setSelectedSupplier}
                        value={selectedSupplier}
                        onOpenSupplierModal={() => setShowSupplierModal(true)}
                        isSupplierModalOpen={showSupplierModal}
                        reloadKey={supplierReloadKey}
                    />
                </div>
            </div>

            {/* Items */}
            <div className={stylesForm.sectionCard}>
                <div className={stylesForm.sectionHeader}>
                    <MdNoteAdd className={stylesForm.sectionIcon} />
                    <h3 className={stylesForm.sectionTitle}>Sản phẩm nhập *</h3>
                </div>
                <ImportItemTable
                    fields={watchedItems}
                    register={register}
                    append={() => setValue("items", [...watchedItems, { productName: "", quantity: 0, importPrice: 0, profitPercent: 20, unit: "Cái" }])}
                    remove={(i) => setValue("items", watchedItems.filter((_, idx) => i !== idx))}
                    setValue={setValue}
                    errors={errors.items}
                />
            </div>

            {/* Total */}
            <div className={stylesForm.sectionCard}>
                <div className={stylesForm.sectionHeader}>
                    <MdCalculate className={stylesForm.sectionIcon} />
                    <h3 className={stylesForm.sectionTitle}>Tổng kết</h3>
                </div>
                <div className={stylesForm.totalSection}>
                    <strong className={stylesForm.totalText}>Tổng tiền: {totalAmount.toLocaleString("vi-VN")} ₫</strong>
                </div>
            </div>

            {/* Note */}
            <div className={stylesForm.sectionCard}>
                <div className={stylesForm.sectionHeader}>
                    <MdNoteAdd className={stylesForm.sectionIcon} />
                    <h3 className={stylesForm.sectionTitle}>Ghi chú</h3>
                </div>
                <textarea {...register("note", { maxLength: { value: 500, message: "Ghi chú quá dài" } })} rows={3} className={stylesForm.formTextarea} />
            </div>

            <div className={stylesForm.formActions}>
                <button type="button" onClick={onCancel} className={stylesForm.cancelBtn} disabled={loading}>
                    <MdClose size={18} /> Hủy
                </button>
                <button type="submit" disabled={!selectedSupplier || watchedItems.length === 0 || loading} className={stylesForm.submitBtn}>
                    {loading ? "Đang lưu..." : "Lưu"}
                </button>
            </div>

            <Modal
                isOpen={showSupplierModal}
                onClose={() => setShowSupplierModal(false)}
                title={editingSupplierId ? "Cập nhật Nhà cung cấp" : "Thêm Nhà cung cấp"}
            >
                <SupplierForm
                    form={supplierForm}
                    editingId={editingSupplierId}
                    onChange={(e) => setSupplierForm({ ...supplierForm, [e.target.name]: e.target.value })}
                    onSubmit={handleSupplierSubmit}
                    onCancel={() => setShowSupplierModal(false)}
                />
            </Modal>
        </form>
    );
}