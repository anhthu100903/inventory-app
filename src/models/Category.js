export class Category {
  constructor({
    id = null,
    name = "",
    description = "",
    createdAt = new Date(),
    updatedAt = new Date(),
    isDeleted = false,
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.isDeleted = isDeleted;
  }

  // Chuyển Category thành object plain để lưu Firestore
  toFirestore() {
    return {
      name: this.name,
      description: this.description,
      updatedAt: new Date(),
      isDeleted: this.isDeleted,
    };
  }

  // Chuyển Firestore document thành Category instance
  static fromFirestore(id, data = {}) {
    return new Category({
      id,
      name: data.name || "",
      description: data.description || "",
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      isDeleted: data.isDeleted || false,
    });
  }
}
