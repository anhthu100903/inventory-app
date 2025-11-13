export class ImportReceipt {
  constructor({ supplierId, supplierName, items }) {
    this.supplierId = supplierId;
    this.supplierName = supplierName;
    this.items = items;
    this.createdAt = new Date();
  }

  /**
   * Chuyển đổi đối tượng Model sang định dạng Firestore có thể lưu được (DTO - Data Transfer Object).
   */
  toFirestore() {
    return {
      supplierId: this.supplierId,
      supplierName: this.supplierName,
      items: this.items,
      createdAt: this.createdAt,
    };
  }
}
