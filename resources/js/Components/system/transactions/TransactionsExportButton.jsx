import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ExportExcel from "@/Components/system/excel/ExportExcel";

export default function TransactionsExportButton({ filters = {} }) {
  const [exportData, setExportData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await axios.get(route("transacoes.export_data"), {
          params: {
            bank_user_id: filters.bank_user_id || undefined,
            category_id: filters.category_id || undefined,
          },
        });

        if (!isMounted) return;
        const raw = Array.isArray(response.data) ? response.data : [];

        const sorted = [...raw].sort((a, b) => {
          const ka = a.year_month || "";
          const kb = b.year_month || "";
          if (ka === kb) {
            return String(a.created_at || "").localeCompare(String(b.created_at || ""));
          }
          return ka.localeCompare(kb);
        });

        setExportData(sorted);
      } catch (error) {
        console.error(error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Não foi possível carregar as transações para exportação.");
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [filters.bank_user_id, filters.category_id]);

  const header = useMemo(
    () => ({
      month_label: { name: "Mês/Ano" },
      // id: { name: "ID" },
      created_at_formatted: { name: "Data" },
      type: { name: "Tipo" },
      status: { name: "Status" },
      title: { name: "Título" },
      description: { name: "Descrição" },
      amount: { name: "Valor" },
      total_installments: { name: "Parcelas Totais" },
      current_installment: { name: "Parcela Atual" },
      is_recurring: { name: "Recorrente" },
      "bank_user.bank.name": { name: "Banco" },
      "category.name": { name: "Categoria" },
    }),
    [],
  );

  return (
    <ExportExcel
      data={exportData}
      header={header}
      name="transacoes_faturas"
      currencyColumns={["Valor"]}
    />
  );
}
