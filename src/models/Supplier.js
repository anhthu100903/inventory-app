// models/Supplier.js
import { serverTimestamp } from "firebase/firestore";

export class Supplier {
  constructor({ id = null, name = '', email = '', phone = '', address = '', note = '', createdAt = null, updatedAt = null } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.note = note;
    this.createdAt = createdAt;   // Firestore Timestamp or Date or null
    this.updatedAt = updatedAt;
  }

  // DTO để lưu lên Firestore. isNew = true => thêm createdAt
  toFirestore(isNew = false) {
    const data = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      note: this.note,
      updatedAt: serverTimestamp(),
    };

    if (isNew) data.createdAt = serverTimestamp();
    return data;
  }

  // Chuẩn hóa dữ liệu từ Firestore -> Supplier instance
  static fromFirestore(id, data = {}) {
    return new Supplier({
      id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      note: data.note || '',
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    });
  }

  // Trả về plain object (ví dụ khi lưu embedded inside Import)
  toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      note: this.note,
    };
  }
}
