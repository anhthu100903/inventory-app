// useDashboard.js
import { useEffect, useState } from "react";
import { getAllInvoices } from "@services/saleService";
import { getAllProducts } from "@services/productService";
import { getImports } from "@services/importService";
import {
    calculateTotalRevenue,
    calculateInventoryNumber,
    getTopProducts,
    getLowStockProducts,
    getRecentInvoices,
    calculateTotalImportAmount,
    calculateRevenueThisWeek,
    calculateRevenueThisMonth,
    calculateRevenueThisYear,
} from "@features/Dashboard/helpers/helpers";

export default function useDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalProducts: 0,
        totalInvoices: 0,
        inventoryNumber: 0,
        topProducts: [],
        recentInvoices: [],
        lowStockProducts: [],
        totalImportAmount: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
    });

    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Load main stats
    useEffect(() => {
        const loadStats = async () => {
            try {
                const invoices = await getAllInvoices();
                const products = await getAllProducts();

                setStats((prev) => ({
                    ...prev,
                    totalRevenue: calculateTotalRevenue(invoices),
                    weeklyRevenue: calculateRevenueThisWeek(invoices),
                    monthlyRevenue: calculateRevenueThisMonth(invoices),
                    yearlyRevenue: calculateRevenueThisYear(invoices),
                    totalProducts: products.length,
                    totalInvoices: invoices.length,
                    inventoryNumber: calculateInventoryNumber(products),
                    topProducts: getTopProducts(invoices),
                    recentInvoices: getRecentInvoices(invoices),
                    lowStockProducts: getLowStockProducts(products),
                }));
            } catch (err) {
                console.error("Failed to load stats:", err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    // Load import stats later
    useEffect(() => {
        const loadImportStats = async () => {
            try {
                const imports = await getImports();
                const totalImportAmount = calculateTotalImportAmount(imports);

                setStats((prev) => ({ ...prev, totalImportAmount }));
            } catch (err) {
                console.warn("Failed to load imports:", err);
            }
        };

        const timer = setTimeout(loadImportStats, 500);
        return () => clearTimeout(timer);
    }, []);

    const refreshStats = async () => {
        const invoices = await getAllInvoices();
        const products = await getAllProducts();

        setStats((prev) => ({
            ...prev,
            totalRevenue: calculateTotalRevenue(invoices),
            weeklyRevenue: calculateRevenueThisWeek(invoices),
            monthlyRevenue: calculateRevenueThisMonth(invoices),
            yearlyRevenue: calculateRevenueThisYear(invoices),
            totalProducts: products.length,
            totalInvoices: invoices.length,
            inventoryNumber: calculateInventoryNumber(products),
            topProducts: getTopProducts(invoices),
            recentInvoices: getRecentInvoices(invoices, 10),
            lowStockProducts: getLowStockProducts(products),
        }));
    };

    const handleCreateInvoice = async () => {
        try {
            setShowCreateForm(false);
            await refreshStats();
        } catch (err) {
            console.error("Failed to create invoice:", err);
        }
    };

    const handleCancelCreate = () => {
        setShowCreateForm(false);
    };

    return {
        stats,
        loading,
        showCreateForm,
        setShowCreateForm,
        handleCreateInvoice,
        handleCancelCreate,
    };
}
