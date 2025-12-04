// inventory-app/src/hooks/useProducts.js
import { useState, useEffect, useMemo } from "react";
import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} from "@services/productService";
import { getAllCategories } from "@services/productService";

const ITEMS_PER_PAGE = 50;

export default function useProducts() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [loading, setLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const [showDropdownId, setShowDropdownId] = useState(null);
    const [dropdownPos, setDropdownPos] = useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Load products & categories
    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getAllProducts();
            const active = data.filter((p) => !p.isDeleted);
            setProducts(active);
            setFilteredProducts(active);

            const cats = await getAllCategories();
            setCategories(cats.map((c) => c.name));
        } catch (err) {
            console.error(err);
            alert("Lỗi khi tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Filter by search + category
    useEffect(() => {
        let result = products;

        if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
            );
        }

        setFilteredProducts(result);
        setCurrentPage(1);
    }, [products, searchQuery, selectedCategory]);

    // CRUD
    const handleAddProduct = async (data) => {
        setLoading(true);
        try {
            await addProduct(data);
            await loadProducts();
            setShowForm(false);
            alert("Thêm sản phẩm thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi thêm sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleUpdateProduct = async (data) => {
        if (!editingProduct) return;
        setLoading(true);
        try {
            await updateProduct(editingProduct.id, data);
            await loadProducts();
            setEditingProduct(null);
            setShowForm(false);
            alert("Cập nhật sản phẩm thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi cập nhật sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
        setLoading(true);
        try {
            await deleteProduct(id);
            await loadProducts();
            alert("Xóa sản phẩm thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    // Dropdown logic (mobile)
    const toggleDropdown = (e, id) => {
        e.stopPropagation();
        const btn = e.currentTarget;
        if (btn && btn.getBoundingClientRect) {
            const r = btn.getBoundingClientRect();
            setDropdownPos({
                top: r.bottom + window.scrollY,
                left: r.left + window.scrollX,
                right: window.innerWidth - r.right,
            });
        }
        setShowDropdownId((prev) => (prev === id ? null : id));
    };

    useEffect(() => {
        const handleClickOutside = () => setShowDropdownId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Detail modal
    const openDetail = (product) => {
        setSelectedProduct(product);
        setIsDetailOpen(true);
        setShowDropdownId(null);
    };
    const closeDetail = () => setIsDetailOpen(false);

    const totalPages = useMemo(() => Math.ceil(filteredProducts.length / ITEMS_PER_PAGE), [filteredProducts]);

    return {
        products: filteredProducts,
        categories,
        loading,

        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,

        showForm,
        setShowForm,
        editingProduct,
        openEdit,
        closeForm,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,

        currentPage,
        setCurrentPage,
        totalPages,

        showDropdownId,
        dropdownPos,
        toggleDropdown,

        selectedProduct,
        isDetailOpen,
        openDetail,
        closeDetail,
    };
}
