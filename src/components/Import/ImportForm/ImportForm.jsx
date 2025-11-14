import React, { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { MdCalendarToday, MdBusiness, MdNoteAdd, MdCalculate, MdAddCircle, MdCheckCircle, MdClose } from "react-icons/md";
import Modal from "../../Modal";
import SupplierForm from "../../Supplier/SupplierForm";
import SupplierSelect from "../SupplierSelect/SupplierSelect";
import ImportItemTable from "../ImportItemTable/ImportItemTable";
import styles from "./ImportForm.module.css";

// Helper: Chuyển Date object (hoặc Timestamp) sang format YYYY-MM-DD cho input[type="date"]
const formatDateToISO = (date) => {
    if (!date) return new Date().toISOString().slice(0, 10);
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
};

export default function ImportForm({ initialData, onSubmit, onCancel, loading = false }) {
    
    // 🚨 FIX 1: Chuẩn hóa dữ liệu ban đầu cho useForm
    const defaultFormValues = useMemo(() => {
        const dateValue = initialData?.importDate 
            ? formatDateToISO(initialData.importDate) // Chuẩn hóa ngày
            : new Date().toISOString().slice(0, 10);
        
        return initialData ? {
            ...initialData,
            importDate: dateValue, // Đảm bảo importDate là chuỗi ISO
        } : {
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
    const totalAmount = watchedItems.reduce((sum, item) => sum + (item?.quantity || 0) * (item?.importPrice || 0), 0);
    
    // 🚨 FIX 2: Sử dụng state riêng biệt cho Nhà Cung Cấp
    const [selectedSupplier, setSelectedSupplier] = useState(null); 
    
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [supplierForm, setSupplierForm] = useState({ name: "", email: "", phone: "", address: "", note: "" });
    const [editingSupplierId, setEditingSupplierId] = useState(null);
    
    // 🚨 FIX 3: Đồng bộ hóa dữ liệu khi initialData thay đổi (Edit Mode)
    useEffect(() => {
        if (initialData) {
            // Reset form với dữ liệu đã chuẩn hóa (importDate là ISO string)
            reset(defaultFormValues); 
            // Set state Nhà cung cấp riêng biệt
            setSelectedSupplier(initialData.supplier || null); 
            console.debug("ImportForm: initialData.importDate:", initialData.importDate, "-> default importDate:", defaultFormValues.importDate);
        } else {
            // Reset về trạng thái thêm mới 
            reset(defaultFormValues); 
            setSelectedSupplier(null);
        }
    }, [initialData, reset, defaultFormValues]); 
    
    // Đặt lại giá trị totalAmount sau mỗi lần render
    useEffect(() => {
        setValue("totalAmount", totalAmount);
    }, [totalAmount, setValue]);

    const handleLocalSubmit = (data) => {
        if (!selectedSupplier || watchedItems.length === 0) {
            alert("Vui lòng chọn nhà cung cấp và thêm ít nhất một sản phẩm.");
            return;
        }

        // Chuyển Supplier instance -> plain object
        const supplierPlain = (selectedSupplier && typeof selectedSupplier.toPlainObject === "function")
          ? selectedSupplier.toPlainObject()
          : (selectedSupplier && typeof selectedSupplier === "object")
            ? {
                id: selectedSupplier.id,
                name: selectedSupplier.name,
                email: selectedSupplier.email,
                phone: selectedSupplier.phone,
                address: selectedSupplier.address,
                note: selectedSupplier.note,
              }
            : null;

        if (!supplierPlain) {
          console.error("Supplier invalid when submitting import:", selectedSupplier);
          return;
        }

        onSubmit({
          ...data,
          // Chuyển lại chuỗi ISO thành Date object cho Service
          importDate: data.importDate ? new Date(data.importDate) : new Date(), 
          supplier: supplierPlain,
          items: watchedItems,
          totalAmount,
        });
    };

    const handleOpenSupplierModal = (suggestedName = "") => {
        setSupplierForm({ name: suggestedName, email: "", phone: "", address: "", note: "" });
        setEditingSupplierId(null);
        setShowSupplierModal(true);
    };

    const handleSupplierSubmit = async (supplierData) => {
        // Hàm này cần được ủy quyền cho Component cha để thêm/cập nhật DB
        setSelectedSupplier(supplierData);
        setShowSupplierModal(false);
    };

    const handleSupplierCancel = () => {
        setShowSupplierModal(false);
        setEditingSupplierId(null);
    };

    const isSubmitDisabled = !selectedSupplier || watchedItems.length === 0 || loading;

    return (
        <form onSubmit={handleSubmit(handleLocalSubmit)} className={styles.importForm}>
            
            {/* -- date */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}><MdCalendarToday className={styles.sectionIcon} /><h3 className={styles.sectionTitle}>Ngày nhập hàng</h3></div>
                <div className={styles.formGroup}>
                    <input type="date" {...register("importDate", { required: "Chọn ngày nhập" })} className={styles.formInput} max={new Date().toISOString().split("T")[0]} />
                    {errors.importDate && <p className={styles.errorMessage}>{errors.importDate.message}</p>}
                </div>
            </div>

            {/* -- supplier */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}><MdBusiness className={styles.sectionIcon} /><h3 className={styles.sectionTitle}>Nhà cung cấp <span className={styles.required}>*</span></h3></div>
                <div className={styles.formGroup}>
                    <SupplierSelect onSelect={setSelectedSupplier} value={selectedSupplier} onOpenSupplierModal={handleOpenSupplierModal} isSupplierModalOpen={showSupplierModal} />
                </div>
            </div>

            {/* -- items */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}><MdNoteAdd className={styles.sectionIcon} /><h3 className={styles.sectionTitle}>Sản phẩm nhập <span className={styles.required}>*</span></h3></div>
                <div className={styles.formGroup}>
                    <ImportItemTable 
                        fields={watchedItems} 
                        register={register} 
                        append={() => setValue("items", [...watchedItems, { productName: "", quantity: 0, importPrice: 0, profitPercent: 20, unit: "Cái" }])} 
                        remove={(index) => setValue("items", watchedItems.filter((_, i) => i !== index))} 
                        setValue={setValue} 
                        errors={errors.items} 
                    />
                </div>
            </div>

            {/* -- total */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}><MdCalculate className={styles.sectionIcon} /><h3 className={styles.sectionTitle}>Tổng kết</h3></div>
                <div className={styles.totalSection}><strong className={styles.totalText}>Tổng tiền: {totalAmount.toLocaleString("vi-VN")} ₫</strong></div>
            </div>

            {/* -- note */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}><MdNoteAdd className={styles.sectionIcon} /><h3 className={styles.sectionTitle}>Ghi chú</h3></div>
                <div className={styles.formGroup}><textarea {...register("note", { maxLength: { value: 500, message: "Ghi chú quá dài" } })} rows={3} className={styles.formTextarea} /></div>
            </div>

            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={loading}><MdClose size={18}/> Hủy</button>
                <button type="submit" disabled={isSubmitDisabled} className={styles.submitBtn}>{loading ? "Đang lưu..." : "Lưu"}</button>
            </div>

            <Modal isOpen={showSupplierModal} onClose={handleSupplierCancel} title={editingSupplierId ? "Cập nhật Nhà cung cấp" : "Thêm Nhà cung cấp"}>
                <SupplierForm form={supplierForm} editingId={editingSupplierId} onChange={(e) => setSupplierForm({ ...supplierForm, [e.target.name]: e.target.value })} onSubmit={handleSupplierSubmit} onCancel={handleSupplierCancel} />
            </Modal>
        </form>
    );
}