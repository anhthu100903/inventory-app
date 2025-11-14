import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { Category } from "../models/Category";

const CATEGORIES_COLLECTION = "categories";
const categoriesCollectionRef = collection(db, CATEGORIES_COLLECTION);

// Lấy tất cả phân loại (không bị xóa)
export const getAllCategories = async () => {
  const q = query(categoriesCollectionRef, where("isDeleted", "!=", true));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => Category.fromFirestore(doc.id, doc.data()));
};

// Lấy phân loại theo ID
export const getCategoryById = async (id) => {
  const snap = await getDoc(doc(db, CATEGORIES_COLLECTION, id));
  if (!snap.exists()) return null;
  return Category.fromFirestore(snap.id, snap.data());
};

// Thêm phân loại mới
export const addCategory = async (category) => {
  if (!(category instanceof Category)) category = new Category(category);
  const docRef = await addDoc(categoriesCollectionRef, {
    ...category.toFirestore(),
    createdAt: new Date(),
  });
  return new Category({ id: docRef.id, ...category });
};

// Cập nhật phân loại
export const updateCategory = async (id, categoryData) => {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  const data = categoryData instanceof Category ? categoryData.toFirestore() : categoryData;
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

// Xóa phân loại (soft delete)
export const deleteCategory = async (id) => {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, { isDeleted: true, updatedAt: new Date() });
};

// Lấy phân loại theo tên
export const getCategoryByName = async (name) => {
  const q = query(
    categoriesCollectionRef,
    where("name", "==", name),
    where("isDeleted", "!=", true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return Category.fromFirestore(doc.id, doc.data());
};
