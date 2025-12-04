import { useState, useEffect } from "react";
import { getAllCategories, addCategory } from "@services/categoryService";
import { capitalizeText } from "@utils/stringUtils";

export default function useCategories(initialCategories = []) {
  const [categories, setCategories] = useState(initialCategories);
  const [filteredCategories, setFilteredCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Load danh sách category từ server
  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await getAllCategories();
      const names = cats.map(c => c.name);
      setCategories(names);
      setFilteredCategories(names);
    } catch (err) {
      console.error("Lỗi load category", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFilteredCategories(categories.filter(cat =>
        cat.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFilteredCategories(categories);
    }
  }, [search, categories]);

  const addNewCategory = async (name) => {
    if (!name.trim()) throw new Error("Tên phân loại không được để trống");
    setLoading(true);
    try {
      const newCat = { name: capitalizeText(name.trim()), description: "" };
      await addCategory(newCat);
      setCategories(prev => [newCat.name, ...prev]);
      setFilteredCategories(prev => [newCat.name, ...prev]);
      return newCat.name;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    filteredCategories,
    search,
    setSearch,
    addNewCategory,
    loading,
  };
}
