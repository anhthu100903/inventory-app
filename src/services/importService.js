import { db } from "../firebaseConfig";
import { collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";

const importRef = collection(db, "imports");

export const addImportRecord = async (importData) => {
  // 🚨 CHUẨN HÓA DỮ LIỆU: Gọi toFirestore() để chuyển object Model thành plain object
  const dataToSave = importData.toFirestore ? importData.toFirestore() : importData;
  return await addDoc(importRef, dataToSave);
};

export const getImports = async () => {
  const q = query(importRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
