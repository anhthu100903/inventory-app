// features/Supplier/hooks/useSuppliers.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { Supplier } from "@models/Supplier";
import {
  getAllSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "@services/supplierService";

const initialSupplier = new Supplier({});

export default function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState(initialSupplier);
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // ================================================
  // LOAD DATA
  // ================================================
  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (err) {
      console.error("Lỗi load suppliers:", err);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // ================================================
  // SEARCH FILTER
  // ================================================
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const lower = searchTerm.toLowerCase();
    setFilteredSuppliers(
      suppliers.filter((s) => s.name.toLowerCase().includes(lower))
    );
  }, [searchTerm, suppliers]);

  // ================================================
  // FORM HANDLING
  // ================================================
  const resetForm = useCallback(() => {
    setForm(initialSupplier);
    setEditingId(null);
    setIsFormVisible(false);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.name.trim()) return alert("Tên không được để trống!");

      try {
        if (editingId) {
          await updateSupplier(editingId, form);
          alert("Cập nhật thành công!");
        } else {
          await addSupplier(form);
          alert("Thêm thành công!");
        }

        resetForm();
        loadSuppliers();
      } catch (err) {
        console.error(err);
        alert("Đã xảy ra lỗi khi lưu dữ liệu.");
      }
    },
    [form, editingId, resetForm, loadSuppliers]
  );

  // ================================================
  // ACTIONS
  // ================================================
  const openAdd = useCallback(() => {
    setForm(initialSupplier);
    setEditingId(null);
    setIsFormVisible(true);
  }, []);

  const openEdit = useCallback((supplier) => {
    setEditingId(supplier.id);
    setForm(supplier);
    setIsFormVisible(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Bạn có chắc muốn xóa?")) return;

      try {
        await deleteSupplier(id);
        loadSuppliers();
      } catch (err) {
        console.error(err);
      }
    },
    [loadSuppliers]
  );

  const showForm = useMemo(
    () => isFormVisible || editingId !== null,
    [isFormVisible, editingId]
  );

  return {
    suppliers,
    filteredSuppliers,

    searchTerm,
    setSearchTerm,

    form,
    editingId,
    showForm,

    handleChange,
    handleSubmit,
    resetForm,
    openAdd,
    openEdit,
    handleDelete,
  };
}
