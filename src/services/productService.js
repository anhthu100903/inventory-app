import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, doc, query, where, limit, getDoc, orderBy, startAt, endAt } from "firebase/firestore";
import { Product } from "@models/Product";

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
  // Exact match helper (kept for compatibility)
  const q = query(productsCollectionRef, where("name", "==", name), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Prefix search by name (case-insensitive depending on stored value)
// Includes products without category (for creating new products)
export const searchProductsByName = async (name) => {
  if (!name || name.length < 1) return [];
  const start = name;
  const end = name + "\uf8ff";
  const q = query(productsCollectionRef, orderBy("name"), startAt(start), endAt(end), limit(10));
  const snap = await getDocs(q);
  return snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fallback substring (case-insensitive) search when prefix query returns few results
export const searchProductsByNameWithFallback = async (name) => {
  const primary = await searchProductsByName(name);
  if (primary.length >= 8) return primary; // enough results

  // Fallback: perform a client-side substring search (case-insensitive)
  try {
    const snap = await getDocs(productsCollectionRef);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const lower = name.toLowerCase();
    const filtered = all.filter(p => p.name && p.name.toLowerCase().includes(lower));
    // Merge unique by id, keep primary first
    const map = new Map();
    primary.forEach(p => map.set(p.id, p));
    for (const p of filtered) {
      if (!map.has(p.id)) map.set(p.id, p);
      if (map.size >= 20) break;
    }
    return Array.from(map.values()).slice(0, 20);
  } catch (e) {
    console.warn("Fallback product search failed:", e);
    return primary;
  }
};

// Thêm sản phẩm mới
export const addProduct = async (product) => {
  if (!(product instanceof Product)) product = new Product(product);
  if (!product.sku) product.sku = generateSKU(product.name);
  
  // Set maxImportPrice to current import price on creation
  if (product.averageImportPrice && !product.highestImportPrice) {
    product.highestImportPrice = product.averageImportPrice;
  }
  
  const docRef = await addDoc(productsCollectionRef, product.toFirestore());
  return new Product({ id: docRef.id, ...product });
};

/**
 * ✅ Tăng tồn kho và cập nhật giá trung bình, giá nhập cao nhất
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
  const oldMaxPrice = Number(p.highestImportPrice || 0);
  const qty = Number(quantity);
  const price = Number(importPrice || 0);
  const profitPercent = Number(p.profitPercent || 10);

  // Tính tổng tồn kho mới
  const newStock = oldStock + qty;

  // Tính giá trung bình nhập mới
  const newAvgPrice = oldStock === 0
    ? price
    : (oldAvgPrice * oldStock + price * qty) / newStock;

  // Cập nhật giá nhập cao nhất
  const newMaxPrice = Math.max(oldMaxPrice, price);

  // Cập nhật giá bán dựa trên giá nhập cao nhất + lợi nhuận (không cộng VAT ở đây, VAT được cộng ở form)
  const newSellingPrice = newMaxPrice * (1 + profitPercent / 100);

  await updateDoc(docRef, {
    totalInStock: newStock,
    averageImportPrice: newAvgPrice,
    highestImportPrice: newMaxPrice,
    sellingPrice: newSellingPrice,
    updatedAt: new Date(),
  });

  return { totalInStock: newStock, averageImportPrice: newAvgPrice, highestImportPrice: newMaxPrice, sellingPrice: newSellingPrice };
};

// Cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  
  // Get current product to compare import prices
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const currentData = snap.data();
    const currentMaxPrice = Number(currentData.highestImportPrice || 0);
    const newImportPrice = Number(productData.averageImportPrice || 0);
    
    // Update maxImportPrice if the new import price is higher
    if (newImportPrice > currentMaxPrice) {
      productData.highestImportPrice = newImportPrice;
    }
  }
  
  const data = productData instanceof Product ? productData.toFirestore() : productData;
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

// Xóa sản phẩm (soft delete)
export const deleteProduct = async (id) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, { isDeleted: true, updatedAt: new Date() });
};

// Lấy danh sách sản phẩm theo phân loại
export const getProductsByCategory = async (category) => {
  if (!category) {
    const snap = await getDocs(query(productsCollectionRef, where("isDeleted", "!=", true)));
    return snap.docs.map(d => Product.fromFirestore(d.id, d.data()));
  }
  const q = query(productsCollectionRef, where("category", "==", category), where("isDeleted", "!=", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => Product.fromFirestore(d.id, d.data()));
};

// Lấy danh sách tất cả phân loại (unique)
export const getAllCategories = async () => {
  const snap = await getDocs(productsCollectionRef);
  const categories = new Set();
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (data.category && !data.isDeleted) categories.add(data.category);
  });
  return Array.from(categories).sort();
};
