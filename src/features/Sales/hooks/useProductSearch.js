// src/features/Sale/hooks/useProductSearch.js
import { useState, useRef } from "react";
import { searchProductsByNameWithFallback } from "@services/productService";

export default function useProductSearch() {
  const [searchResults, setSearchResults] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);

  const timers = useRef({});

  const search = (index, keyword) => {
    if (timers.current[index]) clearTimeout(timers.current[index]);

    if (!keyword || keyword.trim().length < 2) {
      setSearchResults((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    timers.current[index] = setTimeout(async () => {
      setLoadingIndex(index);

      try {
        const data = await searchProductsByNameWithFallback(keyword.trim());
        setSearchResults((prev) => ({ ...prev, [index]: data }));
      } catch {
        setSearchResults((prev) => ({ ...prev, [index]: [] }));
      } finally {
        setLoadingIndex(null);
      }
    }, 300);
  };

  const clearAt = (index) => {
    setSearchResults((p) => ({ ...p, [index]: [] }));
  };

  return {
    searchResults,
    loadingIndex,
    search,
    clearAt,
  };
}
