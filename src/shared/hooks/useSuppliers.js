import { useState, useEffect } from "react";
import { getAllSuppliers, addSupplier } from "@services/supplierService";

export default function useSuppliers(initialSupplier = null) {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(initialSupplier);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await getAllSuppliers();
        setSuppliers(data);
        setFilteredSuppliers(data);

        if (initialSupplier) {
          const current = data.find((s) => s.name === initialSupplier);
          if (current) setSelectedSupplier(current);
        }
      } catch (err) {
        console.error("Failed to load suppliers:", err);
      }
    };
    loadSuppliers();
  }, [initialSupplier]);

  useEffect(() => {
    if (search.trim()) {
      const filtered = suppliers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [search, suppliers]);

  const addNewSupplier = async (name) => {
    if (!name.trim()) throw new Error("Tên nhà cung cấp không được để trống");
    setLoading(true);
    try {
      const newSupplier = await addSupplier({
        name: name.trim(),
        email: "",
        phone: "",
        address: "",
        note: "",
      });
      setSuppliers((prev) => [...prev, newSupplier]);
      setSelectedSupplier(newSupplier);
      return newSupplier;
    } finally {
      setLoading(false);
    }
  };

  return {
    suppliers,
    filteredSuppliers,
    selectedSupplier,
    setSelectedSupplier,
    search,
    setSearch,
    addNewSupplier,
    loading,
  };
}
