function SupplierList({ suppliers, onEdit, onDelete }) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {suppliers.map((s) => (
        <li
          key={s.id}
          style={{
            border: "1px solid #ddd",
            padding: "8px",
            marginBottom: "6px",
            borderRadius: "6px",
          }}
        >
          <strong>{s.name}</strong> — {s.email} — {s.phone}
          <div style={{ marginTop: "4px" }}>
            <button onClick={() => onEdit(s)} style={{ marginRight: "8px" }}>
              ✏️ Sửa
            </button>
            <button onClick={() => onDelete(s.id)}>🗑️ Xóa</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default SupplierList;
