// services/importService.js
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { Import } from "../models/Import";
import { Product } from "../models/Product";
import { getProductById, findProductsByName, increaseStock, addProduct } from "./productService";

const IMPORTS_COLLECTION = "imports";
const importsCollectionRef = collection(db, IMPORTS_COLLECTION);

const mapDocToImport = (docSnap) => {
  const data = docSnap.data();
  return Import.fromFirestore(docSnap.id, data);
};

export const getImports = async () => {
  try {
    const q = query(importsCollectionRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(mapDocToImport);
  } catch (err) {
    console.error("getImports error:", err);
    throw err;
  }
};

/**
 * ✅ Thêm phiếu nhập và tự động cập nhật tồn kho
 */
export const addImportRecord = async (importData) => {
  try {
    const imp = importData instanceof Import ? importData : new Import(importData);

    // 1️⃣ Chuyển supplier sang plain object (nếu là class)
    if (imp.supplier?.toPlainObject) {
      imp.supplier = imp.supplier.toPlainObject();
    }

    // 2️⃣ Serialize phiếu nhập trước khi lưu
    const dataToSave = imp.toFirestore(true); // tất cả field plain object + Date

    // Helper: sanitize undefined -> null for Firestore compatibility
    // Preserve Date and Firestore Timestamp-like objects (have toDate)
    const sanitize = (val) => {
      if (val === undefined) return null;
      if (val === null) return null;
      if (val instanceof Date) return val;
      if (val && typeof val.toDate === "function") return val; // Firestore Timestamp
      if (Array.isArray(val)) return val.map(sanitize);
      if (typeof val === "object") {
        const out = {};
        for (const [k, v] of Object.entries(val)) {
          out[k] = sanitize(v);
        }
        return out;
      }
      return val;
    };

    const cleaned = sanitize(dataToSave);
    // Ensure supplier.id is not left undefined (Firestore rejects undefined)
    if (cleaned && typeof cleaned.supplier === "object") {
      cleaned.supplier.id = cleaned.supplier.id === undefined ? null : cleaned.supplier.id;
    }

    // 3️⃣ Lưu phiếu nhập trước khi cập nhật tồn kho
    const docRef = await addDoc(importsCollectionRef, cleaned);

    // 4️⃣ Cập nhật tồn kho
    for (const item of imp.items) {
      const qty = Number(item.quantity || 0);
      const price = Number(item.importPrice || 0);
      let product = null;

      if (item.productId) {
        product = await getProductById(item.productId);
      } else {
        const found = await findProductsByName(item.productName);
        product = found.length ? found[0] : null;
      }

      if (product) {
        await increaseStock(product.id, qty, price);
      } else {
        const newProduct = new Product({
          name: item.productName,
          totalInStock: qty,
          unit: item.unit || "Cái",
          averageImportPrice: price,
          sellingPrice: price,
        });
        await addProduct(newProduct);
      }
    }

    // 5️⃣ Trả về phiếu nhập đã lưu
    const savedSnap = await getDoc(doc(importsCollectionRef, docRef.id));
    return Import.fromFirestore(savedSnap.id, savedSnap.data());

  } catch (err) {
    console.error("addImportRecord error:", err);
    throw err;
  }
};


export const getImportById = async (id) => {
  try {
    const snap = await getDoc(doc(db, IMPORTS_COLLECTION, id));
    if (!snap.exists()) return null;
    return mapDocToImport(snap);
  } catch (err) {
    console.error("getImportById error:", err);
    throw err;
  }
};

export const updateImportRecord = async (id, updateData) => {
  try {
    const docRef = doc(db, IMPORTS_COLLECTION, id);
    const imp = updateData instanceof Import ? updateData : new Import(updateData);

    // normalize supplier
    if (imp.supplier && typeof imp.supplier.toPlainObject === "function") {
      imp.supplier = imp.supplier.toPlainObject();
    }

    const dataToUpdate = imp.toFirestore(false);
    delete dataToUpdate.createdAt;

    // sanitize undefined values before update, preserve Dates/Timestamps
    const sanitize = (val) => {
      if (val === undefined) return null;
      if (val === null) return null;
      if (val instanceof Date) return val;
      if (val && typeof val.toDate === "function") return val;
      if (Array.isArray(val)) return val.map(sanitize);
      if (typeof val === "object") {
        const out = {};
        for (const [k, v] of Object.entries(val)) {
          out[k] = sanitize(v);
        }
        return out;
      }
      return val;
    };

    const cleaned = sanitize(dataToUpdate);
    if (cleaned && typeof cleaned.supplier === "object") {
      cleaned.supplier.id = cleaned.supplier.id === undefined ? null : cleaned.supplier.id;
    }
    await updateDoc(docRef, cleaned);
    const snap = await getDoc(docRef);
    return mapDocToImport(snap);
  } catch (err) {
    console.error("updateImportRecord error:", err);
    throw err;
  }
};

export const deleteImportRecord = async (id) => {
  try {
    await deleteDoc(doc(db, IMPORTS_COLLECTION, id));
  } catch (err) {
    console.error("deleteImportRecord error:", err);
    throw err;
  }
};
