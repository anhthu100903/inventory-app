/**
 * items: [{ productId?, productName, quantity, importPrice, unit }]
 */
export class Import {
  constructor({
    id = null,
    supplier = null,   // plain object {id,name,...}
    importDate = null, // ngày nhập hàng
    items = [],
    totalAmount = 0,
    note = '',
    createdAt = null,
    updatedAt = null,
  } = {}) {
    this.id = id;
    this.supplier = supplier;
    this.importDate = importDate instanceof Date ? importDate : (importDate ? new Date(importDate) : new Date());
    this.items = items;
    this.totalAmount = totalAmount;
    this.note = note;
    this.createdAt = createdAt instanceof Date ? createdAt : (createdAt ? new Date(createdAt) : new Date());
    this.updatedAt = updatedAt instanceof Date ? updatedAt : (updatedAt ? new Date(updatedAt) : new Date());
  }

  /**
   * Convert sang object plain để lưu Firestore
   */
  toFirestore(isNew = false) {
    const data = {
      supplier: this.supplier,
      importDate: this.importDate,
      items: this.items,
      totalAmount: this.totalAmount,
      note: this.note,
      updatedAt: new Date(),           // luôn set Date thực
    };
    if (isNew) data.createdAt = new Date(); // chỉ set createdAt khi tạo mới
    return data;
  }

  /**
   * Map document Firestore về Import instance
   */
  static fromFirestore(id, data = {}) {
    return new Import({
      id,
      supplier: data.supplier || null,
      importDate: data.importDate ? new Date(data.importDate.seconds ? data.importDate.toDate() : data.importDate) : new Date(),
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
      note: data.note || '',
      createdAt: data.createdAt ? new Date(data.createdAt.seconds ? data.createdAt.toDate() : data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds ? data.updatedAt.toDate() : data.updatedAt) : new Date(),
    });
  }
}
