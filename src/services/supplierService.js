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

const SUPPLIERS_COLLECTION = "suppliers";

/**
 * ✅ Lấy danh sách tất cả nhà cung cấp
 */
export const getAllSuppliers = async () => {
  const snapshot = await getDocs(collection(db, SUPPLIERS_COLLECTION));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * ✅ Tìm nhà cung cấp theo tên
 */
export const findSupplierByName = async (name) => {
  const q = query(
    collection(db, SUPPLIERS_COLLECTION),
    where("name", "==", name)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * ✅ Thêm nhà cung cấp mới
 */
export const addSupplier = async (supplier) => {
  const docRef = await addDoc(collection(db, SUPPLIERS_COLLECTION), {
    ...supplier,
    createAt: new Date(),
    updateAt: new Date(),
  });
  return { id: docRef.id, ...supplier };
};

/**
 * ✅ Cập nhật nhà cung cấp
 */
export const updateSupplier = async (id, data) => {
  const docRef = doc(db, SUPPLIERS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updateAt: new Date(),
  });
};

/**
 * ✅ Xóa nhà cung cấp
 */
export const deleteSupplier = async (id) => {
  await deleteDoc(doc(db, SUPPLIERS_COLLECTION, id));
};

/**
 * ✅ Lấy chi tiết nhà cung cấp
 */
export const getSupplierById = async (id) => {
  const docRef = doc(db, SUPPLIERS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};
