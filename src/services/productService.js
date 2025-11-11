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
  limit
} from "firebase/firestore";

const PRODUCTS_COLLECTION = "products";

/**
 * ✅ Lấy tất cả sản phẩm
 */
export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * ✅ Thêm sản phẩm mới
 */
export const addProduct = async (product) => {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    createAt: new Date(),
    updateAt: new Date(),
  });
  return { id: docRef.id, ...product };
};

/**
 * ✅ Cập nhật sản phẩm
 */
export const updateProduct = async (id, data) => {
  console.log("Updating product ID:", id, "with data:", data);
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updateAt: new Date(),
  });
};

/**
 * ✅ Xóa sản phẩm
 */
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
};

/**
 * ✅ Lấy chi tiết sản phẩm
 */
export const getProductById = async (id) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

//hàm tìm kiếm sản phẩm theo tên
export const findProductsByName = async (name) => {
  if (!name || name.length < 1) return [];

  const productsRef = collection(db, "products");
  const q = query(
    productsRef,
    where("name", ">=", name),
    where("name", "<=", name + "\uf8ff"),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * ✅ Tìm sản phẩm theo SKU
 */
export const findProductBySKU = async (sku) => {
  const q = query(collection(db, PRODUCTS_COLLECTION), where("sku", "==", sku));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};