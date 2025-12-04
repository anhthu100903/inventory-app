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
  serverTimestamp,
} from "firebase/firestore";
import { Category } from "@models/Category";

const CATEGORIES_COLLECTION = "categories";
const categoriesCollectionRef = collection(db, CATEGORIES_COLLECTION);

function assertValidCategoryPayload(payload) {
  if (!payload || !payload.name || typeof payload.name !== "string") {
    throw new Error("Invalid category payload: missing 'name'.");
  }
}

// Lấy tất cả phân loại (không bị xóa)
export const getAllCategories = async () => {
  const q = query(categoriesCollectionRef, where("isDeleted", "!=", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => Category.fromFirestore(d.id, d.data()));
};

// Lấy phân loại theo ID
export const getCategoryById = async (id) => {
  if (!id) return null;
  const snap = await getDoc(doc(db, CATEGORIES_COLLECTION, id));
  if (!snap.exists()) return null;
  return Category.fromFirestore(snap.id, snap.data());
};

// Thêm phân loại mới
export const addCategory = async (category) => {
  assertValidCategoryPayload(category);
  const instance = category instanceof Category ? category : new Category(category);

  // normalize name trim
  instance.name = instance.name.trim();

  const payload = {
    ...instance.toFirestore(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  };

  const docRef = await addDoc(categoriesCollectionRef, payload);
  return new Category({ id: docRef.id, ...instance });
};

// Cập nhật phân loại
export const updateCategory = async (id, categoryData) => {
  if (!id) throw new Error("updateCategory requires id");
  // allow passing either Category instance or plain object
  const data = categoryData instanceof Category ? categoryData.toFirestore() : categoryData;
  if (data.name) data.name = data.name.trim();

  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

// Xóa phân loại (soft delete)
export const deleteCategory = async (id) => {
  if (!id) throw new Error("deleteCategory requires id");
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, { isDeleted: true, updatedAt: serverTimestamp() });
};

// Lấy phân loại theo tên
export const getCategoryByName = async (name) => {
  if (!name) return null;
  const q = query(
    categoriesCollectionRef,
    where("name", "==", name),
    where("isDeleted", "!=", true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return Category.fromFirestore(d.id, d.data());
};
