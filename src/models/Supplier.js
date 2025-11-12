/**
 * Mô hình (Model) chuẩn hóa cho Nhà cung cấp.
 * Giúp đảm bảo dữ liệu luôn có các thuộc tính này, tránh sai sót khi lưu vào Firestore.
 */
export class Supplier {
    constructor({ id, name, email, phone, address, note, createdAt = new Date(), updatedAt = new Date() }) {
        this.id = id || null; // ID chỉ có khi đã lưu
        this.name = name || '';
        this.email = email || '';
        this.phone = phone || '';
        this.address = address || '';
        this.note = note || '';
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Chuyển đổi đối tượng Model sang định dạng Firestore có thể lưu được (DTO - Data Transfer Object).
     */
    toFirestore() {
        // Loại bỏ ID khỏi dữ liệu lưu trữ
        const data = {
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            note: this.note,
            updatedAt: new Date(),
        };
        // Thêm createdAt chỉ khi thêm mới
        if (!this.id) {
            data.createdAt = new Date();
        }
        return data;
    }
}