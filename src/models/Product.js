export class Product {
  constructor({
    id = null,
    name = "",
    sku = "",
    unit = "Cái",
    category = "",
    categories = [],
    supplier = "",
    totalInStock = 0,
    totalSold = 0,
    averageImportPrice = 0,
    highestImportPrice = 0,
    profitPercent = "10",
    sellingPrice = 0,
    createdAt = new Date(),
    updatedAt = new Date(),
    isDeleted = false,
  } = {}) {
    this.id = id;
    this.name = name;
    this.sku = sku;
    this.unit = unit;
    this.category = category;
    this.categories = Array.isArray(categories) ? categories : [];
    this.supplier = supplier;
    this.totalInStock = totalInStock;
    this.totalSold = totalSold;
    this.averageImportPrice = averageImportPrice;
    this.highestImportPrice = highestImportPrice;
    this.profitPercent = profitPercent;
    this.sellingPrice = sellingPrice;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.isDeleted = isDeleted;
  }

  // Chuyển Product thành object plain để lưu Firestore
  toFirestore() {
    const data = {
      name: this.name,
      sku: this.sku,
      unit: this.unit,
      category: this.category,
      categories: this.categories,
      supplier: this.supplier,
      totalInStock: this.totalInStock,
      totalSold: this.totalSold,
      averageImportPrice: this.averageImportPrice,
      highestImportPrice: this.highestImportPrice,
      profitPercent: this.profitPercent,
      sellingPrice: this.sellingPrice,
      updatedAt: new Date(),
    };
    if (!this.id) {
      data.createdAt = new Date();
    }
    return data;
  }

  // Chuyển Firestore document thành Product instance
  static fromFirestore(id, data = {}) {
    return new Product({
      id,
      name: data.name || "",
      sku: data.sku || "",
      unit: data.unit || "Cái",
      category: data.category || "",
      categories: Array.isArray(data.categories) ? data.categories : [],
      supplier: data.supplier || "",
      totalInStock: data.totalInStock || 0,
      totalSold: data.totalSold || 0,
      averageImportPrice: data.averageImportPrice || 0,
      highestImportPrice: data.highestImportPrice || 0,
      profitPercent: data.profitPercent || "10",
      sellingPrice: data.sellingPrice || 0,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      isDeleted: data.isDeleted || false,
    });
  }
}
