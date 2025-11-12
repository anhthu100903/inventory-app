import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function SupplierSelect({ onSelect }) {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const querySnapshot = await getDocs(collection(db, "suppliers"));
      const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSuppliers(data);
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (search.trim() === "") setFiltered([]);
    else {
      const result = suppliers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(result);
    }
  }, [search, suppliers]);

  const handleAddNew = async () => {
    if (!window.confirm(`Nhà cung cấp "${search}" chưa có, thêm mới không?`))
      return;
    const newSupplier = { name: search, createAt: new Date() };
    const docRef = await addDoc(collection(db, "suppliers"), newSupplier);
    const created = { id: docRef.id, ...newSupplier };
    setSuppliers([...suppliers, created]);
    onSelect(created);
    alert("✅ Đã thêm nhà cung cấp mới!");
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 text-gray-700 font-medium">
        Nhà cung cấp
      </label>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full"
        placeholder="Nhập tên nhà cung cấp..."
      />
      {filtered.length > 0 && (
        <ul className="border rounded mt-2 bg-white shadow-sm">
          {filtered.map((s) => (
            <li
              key={s.id}
              onClick={() => {
                onSelect(s);
                setSearch(s.name);
                setFiltered([]);
              }}
              className="p-2 hover:bg-blue-50"
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
      {search && filtered.length === 0 && (
        <button
          onClick={handleAddNew}
          className="mt-2 text-sm text-blue-600 underline"
        >
          ➕ Thêm mới nhà cung cấp "{search}"
        </button>
      )}
    </div>
  );
}
