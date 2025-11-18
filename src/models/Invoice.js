export class Invoice {
  constructor({
    id = null,
    invoiceNumber = "",
    date = new Date(),
    items = [],
    totalAmount = 0,
    customer = "",
    note = "",
    createdAt = new Date(),
    updatedAt = new Date(),
    isDeleted = false,
  } = {}) {
    this.id = id;
    this.invoiceNumber = invoiceNumber;
    this.date = date instanceof Date ? date : new Date(date);
    this.items = Array.isArray(items) ? items : [];
    this.totalAmount = totalAmount;
    this.customer = customer;
    this.note = note;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.isDeleted = isDeleted;
  }

  toFirestore() {
    const data = {
      invoiceNumber: this.invoiceNumber,
      date: this.date,
      items: this.items,
      totalAmount: this.totalAmount,
      customer: this.customer,
      note: this.note,
      updatedAt: new Date(),
    };
    if (!this.id) data.createdAt = new Date();
    return data;
  }

  static fromFirestore(id, data = {}) {
    return new Invoice({
      id,
      invoiceNumber: data.invoiceNumber || "",
      date: data.date ? new Date(data.date) : new Date(),
      items: Array.isArray(data.items) ? data.items : [],
      totalAmount: data.totalAmount || 0,
      customer: data.customer || "",
      note: data.note || "",
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      isDeleted: data.isDeleted || false,
    });
  }
}
