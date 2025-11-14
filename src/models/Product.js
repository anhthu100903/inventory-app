export class Product {
  constructor({
    id = null,
    name = "",
    sku = "",
    unit = "Cái",
    category = "",
    supplier = "",
    totalInStock = 0,
    totalSold = 0,
    averageImportPrice = 0,
    highestImportPrice = 0,
    profitPercent = "10",
    sellingPrice = 0,
    createdAt = new Date(),
    updatedAt = new Date(),
  } = {}) {
    this.id = id;
    this.name = name;
    this.sku = sku;
    this.unit = unit;
    this.category = category;
    this.supplier = supplier;
    this.totalInStock = totalInStock;
    this.totalSold = totalSold;
    this.averageImportPrice = averageImportPrice;
    this.highestImportPrice = highestImportPrice;
    this.profitPercent = profitPercent;
    this.sellingPrice = sellingPrice;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // Chuyển Product thành object plain để lưu Firestore
  toFirestore() {
    const data = {
      name: this.name,
      sku: this.sku,
      unit: this.unit,
      category: this.category,
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
}
