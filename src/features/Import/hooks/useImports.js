import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getImports,
  addImportRecord,
  deleteImportRecord,
  updateImportRecord,
} from "@services/importService";
import { format } from "date-fns";
import { toDateOrNull } from "@shared/utils/dateUtils";

export default function useImports() {
  const [imports, setImports] = useState([]);
  const [filteredImports, setFilteredImports] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filterMonth, setFilterMonth] = useState(
    new Date().getMonth() + 1
  );
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterDate, setFilterDate] = useState("");

  const [yearError, setYearError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Load imports
   */
  const fetchImports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getImports();
      setImports(data);
    } catch (err) {
      alert("Lỗi tải phiếu nhập: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  /**
   * Filtering logic
   */
  useEffect(() => {
    let list = imports;

    if (filterDate) {
      list = list.filter((imp) => {
        const d = toDateOrNull(imp.createdAt);
        return d && format(d, "yyyy-MM-dd") === filterDate;
      });
    } else if (filterMonth && filterYear) {
      const m = String(filterMonth).padStart(2, "0");
      const target = `${filterYear}-${m}`;

      list = list.filter((imp) => {
        const d = toDateOrNull(imp.createdAt);
        return d && format(d, "yyyy-MM") === target;
      });
    }

    setFilteredImports(list);
  }, [imports, filterMonth, filterYear, filterDate]);

  /**
   * Year validation
   */
  const handleSetYear = useCallback((value) => {
    if (!value) {
      setFilterYear("");
      setYearError("");
      return;
    }

    if (!/^[0-9]{1,4}$/.test(value)) {
      setYearError("Năm không hợp lệ");
      return;
    }

    const n = Number(value);
    if (n < 2000 || n > 2100) {
      setYearError("Năm phải trong 2000–2100");
      return;
    }

    setYearError("");
    setFilterYear(n);
  }, []);

  /**
   * Modal logic
   */
  const handleAdd = () => {
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa phiếu nhập này?")) return;

    setLoading(true);
    try {
      await deleteImportRecord(id);
      await fetchImports();
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Form submit
   */
  const handleSubmit = async (data) => {
    setLoading(true);

    try {
      if (editingId) {
        await updateImportRecord(editingId, data);
      } else {
        await addImportRecord(data);
      }

      await fetchImports();
      closeModal();
    } catch (err) {
      alert("Lỗi lưu dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Memoized editing import
   */
  const editingImport = useMemo(() => {
    if (!editingId) return null;
    return imports.find((i) => i.id === editingId) || null;
  }, [editingId, imports]);

  return {
    filteredImports,
    loading,
    filterMonth,
    filterYear,
    filterDate,
    yearError,
    showModal,
    editingImport,

    setFilterMonth,
    setFilterDate,
    setFilterYear: handleSetYear,

    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    closeModal,
  };
}
