import { useEffect, useState } from "react";
import SupplierForm from "../components/Supplier/SupplierForm";
import SupplierList from "../components/Supplier/SupplierList";
import {
  getAllSuppliers,
  addSupplier,
  deleteSupplier,
  updateSupplier,
} from "../services/supplierService";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });
  const [editingId, setEditingId] = useState(null);

  // 🔹 Load dữ liệu Firestore
  const loadSuppliers = async () => {
    const data = await getAllSuppliers();
    setSuppliers(data);
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // 🔹 Sự kiện form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("Tên không được để trống!");

    try {
      if (editingId) {
        await updateSupplier(editingId, form);
        alert("✅ Cập nhật thành công!");
        setEditingId(null);
      } else {
        await addSupplier(form);
        alert("✅ Thêm thành công!");
      }

      setForm({ name: "", email: "", phone: "", address: "", note: "" });
      loadSuppliers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhà cung cấp này không?")) {
      await deleteSupplier(id);
      loadSuppliers();
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      note: supplier.note,
    });
  };
  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", email: "", phone: "", address: "", note: "" });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📦 Quản lý nhà cung cấp</h2>

      <SupplierForm
        form={form}
        editingId={editingId}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <SupplierList
        suppliers={suppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Suppliers;
