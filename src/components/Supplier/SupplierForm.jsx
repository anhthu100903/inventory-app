function SupplierForm({ form, editingId, onChange, onSubmit, onCancel }) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxWidth: "350px",
        marginBottom: "1.5rem",
      }}
    >
      <input name="name" placeholder="Tên" value={form.name} onChange={onChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
      <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={onChange} />
      <input name="address" placeholder="Địa chỉ" value={form.address} onChange={onChange} />
      <textarea name="note" placeholder="Ghi chú" value={form.note} onChange={onChange} />

      <button
        type="submit"
        style={{
          background: editingId ? "#2196F3" : "#4CAF50",
          color: "#fff",
          padding: "8px",
        }}
      >
        {editingId ? "💾 Cập nhật" : "➕ Thêm"}
      </button>

      {editingId && (
        <button type="button" onClick={onCancel}>
          ❌ Hủy
        </button>
      )}
    </form>
  );
}

export default SupplierForm;