// services/supplierService.js
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
  where,
  orderBy,
} from "firebase/firestore";
import { Supplier } from "../models/Supplier";

const SUPPLIERS_COLLECTION = "suppliers";
const suppliersCollectionRef = collection(db, SUPPLIERS_COLLECTION);

const mapDocToSupplier = (docSnap) => {
  const data = docSnap.data();
  return Supplier.fromFirestore(docSnap.id, data);
};

export const getAllSuppliers = async () => {
  try {
    const q = query(suppliersCollectionRef, orderBy("name", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(mapDocToSupplier);
  } catch (err) {
    console.error("getAllSuppliers error:", err);
    throw err;
  }
};

export const findSupplierByName = async (name) => {
  try {
    const q = query(suppliersCollectionRef, where("name", "==", name));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return mapDocToSupplier(snap.docs[0]);
  } catch (err) {
    console.error("findSupplierByName error:", err);
    throw err;
  }
};

export const addSupplier = async (supplierData) => {
  try {
    const supplier = new Supplier(supplierData);
    const docRef = await addDoc(suppliersCollectionRef, supplier.toFirestore(true));
    // reload for server timestamp
    const saved = await getDoc(doc(docRef.firestore, SUPPLIERS_COLLECTION, docRef.id));
    return mapDocToSupplier(saved);
  } catch (err) {
    console.error("addSupplier error:", err);
    throw err;
  }
};

export const updateSupplier = async (id, data) => {
  try {
    const docRef = doc(db, SUPPLIERS_COLLECTION, id);
    const supplier = new Supplier(data);
    const updated = supplier.toFirestore(false);
    delete updated.createdAt;
    await updateDoc(docRef, updated);
    const snap = await getDoc(docRef);
    return mapDocToSupplier(snap);
  } catch (err) {
    console.error("updateSupplier error:", err);
    throw err;
  }
};

export const deleteSupplier = async (id) => {
  try {
    await deleteDoc(doc(db, SUPPLIERS_COLLECTION, id));
  } catch (err) {
    console.error("deleteSupplier error:", err);
    throw err;
  }
};

export const getSupplierById = async (id) => {
  try {
    const snap = await getDoc(doc(db, SUPPLIERS_COLLECTION, id));
    if (!snap.exists()) return null;
    return mapDocToSupplier(snap);
  } catch (err) {
    console.error("getSupplierById error:", err);
    throw err;
  }
};
