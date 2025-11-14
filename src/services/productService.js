import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, doc, query, where, limit, getDoc } from "firebase/firestore";
import { Product } from "../models/Product";

const PRODUCTS_COLLECTION = "products";
const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);

// Tạo SKU: chữ cái đầu + 3 số ngẫu nhiên
export const generateSKU = (name) => {
  const firstLetter = name.trim()[0]?.toUpperCase() || "X";
  const randomNum = Math.floor(Math.random() * 900 + 100); // 100–999
  return `${firstLetter}-${randomNum}`;
};


export const getAllProducts = async () => {
  const snap = await getDocs(productsCollectionRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductById = async (id) => {
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const findProductsByName = async (name) => {
  if (!name || name.length < 1) return [];
  const q = query(productsCollectionRef, where("name", "==", name), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Thêm sản phẩm mới
export const addProduct = async (product) => {
  if (!(product instanceof Product)) product = new Product(product);
  if (!product.sku) product.sku = generateSKU(product.name);
  const docRef = await addDoc(productsCollectionRef, product.toFirestore());
  return new Product({ id: docRef.id, ...product });
};

/**
 * ✅ Tăng tồn kho và cập nhật giá trung bình
 * @param {string} productId 
 * @param {number} quantity Số lượng nhập
 * @param {number} importPrice Giá nhập sản phẩm mới
 */
export const increaseStock = async (productId, quantity, importPrice) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Product not found");

  const p = snap.data();

  // Ép kiểu number để tránh cộng chuỗi
  const oldStock = Number(p.totalInStock || 0);
  const oldAvgPrice = Number(p.averageImportPrice || 0);
  const qty = Number(quantity);
  const price = Number(importPrice || 0);
  const profitPercent = Number(p.profitPercent || 10);

  // Tính tổng tồn kho mới
  const newStock = oldStock + qty;

  // Tính giá trung bình nhập mới
  const newAvgPrice = oldStock === 0
    ? price
    : (oldAvgPrice * oldStock + price * qty) / newStock;

  // Cập nhật giá bán dựa trên profitPercent
  const newSellingPrice = newAvgPrice * (1 + profitPercent / 100);

  await updateDoc(docRef, {
    totalInStock: newStock,
    averageImportPrice: newAvgPrice,
    sellingPrice: newSellingPrice,
    updatedAt: new Date(),
  });

  return { totalInStock: newStock, averageImportPrice: newAvgPrice, sellingPrice: newSellingPrice };
};
