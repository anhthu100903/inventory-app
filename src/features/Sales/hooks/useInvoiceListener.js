import { useState, useEffect } from "react";
import { listenInvoicesByMonthYear, listenInvoicesByDate } from "@services/saleService";

export const useInvoiceListener = ({ filterMonth, filterYear, filterDate }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    let unsub = filterDate
      ? listenInvoicesByDate(filterDate, handleSet)
      : listenInvoicesByMonthYear(filterMonth, filterYear, handleSet);

    return () => unsub && unsub();

    function handleSet(items) {
      setInvoices(items);
      setLoading(false);
    }
  }, [filterMonth, filterYear, filterDate]);

  return { invoices, loading };
};
