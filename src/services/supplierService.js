import { db } from "../firebaseConfig";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    query,
    where,
} from "firebase/firestore";
// 🚨 Import Supplier Model từ đường dẫn bạn đã tạo
import { Supplier } from '../models/Supplier'; 

const SUPPLIERS_COLLECTION = "suppliers";
const suppliersCollectionRef = collection(db, SUPPLIERS_COLLECTION);

/**
 * Hàm helper: Chuyển đổi Firestore Document sang Supplier Model
 * Đảm bảo các thuộc tính ngày tháng được chuyển đổi đúng cách.
 */
const mapDocToSupplier = (docSnap) => {
    const data = docSnap.data();
    return new Supplier({
        id: docSnap.id,
        ...data,
        // Chuyển đổi Firestore Timestamp sang đối tượng Date (nếu cần)
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    });
};

// ----------------------------------------------------
// ✅ Lấy danh sách tất cả nhà cung cấp
// ----------------------------------------------------
export const getAllSuppliers = async () => {
    const snapshot = await getDocs(suppliersCollectionRef);
    // 🚨 Sử dụng hàm helper để map và chuẩn hóa dữ liệu
    return snapshot.docs.map(mapDocToSupplier);
};

// ----------------------------------------------------
// ✅ Tìm nhà cung cấp theo tên
// ----------------------------------------------------
export const findSupplierByName = async (name) => {
    const q = query(
        suppliersCollectionRef,
        where("name", "==", name)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        // 🚨 Chuẩn hóa dữ liệu đầu ra bằng Model
        return mapDocToSupplier(docSnap);
    }
    return null;
};

// ----------------------------------------------------
// ✅ Thêm nhà cung cấp mới
// ----------------------------------------------------
export const addSupplier = async (supplierData) => {
    // 🚨 CHUẨN HÓA DỮ LIỆU ĐẦU VÀO: Tạo Model và lấy DTO để lưu
    const newSupplier = new Supplier(supplierData);
    
    // Sử dụng hàm toFirestore() của Model để lấy dữ liệu đã chuẩn hóa (có timestamp)
    const docRef = await addDoc(suppliersCollectionRef, newSupplier.toFirestore());
    
    // Trả về Model đã có ID
    return new Supplier({ id: docRef.id, ...newSupplier });
};

// ----------------------------------------------------
// ✅ Cập nhật nhà cung cấp
// ----------------------------------------------------
export const updateSupplier = async (id, data) => {
    const docRef = doc(db, SUPPLIERS_COLLECTION, id);
    
    // 🚨 CHUẨN HÓA DỮ LIỆU ĐẦU VÀO: Chỉ cập nhật các trường dữ liệu và updatedAt
    const updatedData = new Supplier({ id, ...data }).toFirestore();
    
    // Loại bỏ createdAt khỏi dữ liệu cập nhật
    delete updatedData.createdAt; 

    await updateDoc(docRef, updatedData);
};

// ----------------------------------------------------
// ✅ Xóa nhà cung cấp
// ----------------------------------------------------
export const deleteSupplier = async (id) => {
    await deleteDoc(doc(db, SUPPLIERS_COLLECTION, id));
};

// ----------------------------------------------------
// ✅ Lấy chi tiết nhà cung cấp
// ----------------------------------------------------
export const getSupplierById = async (id) => {
    const docRef = doc(db, SUPPLIERS_COLLECTION, id);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
        // 🚨 Chuẩn hóa dữ liệu đầu ra bằng Model
        return mapDocToSupplier(snap);
    }
    return null;
};