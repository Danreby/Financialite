import React, { useMemo } from "react";
import ExportExcel from "@/Components/system/excel/ExportExcel";

export default function FaturaPendingExportButton({ monthlyGroups = [] }) {
  const { rows, header } = useMemo(() => {
    if (!monthlyGroups || monthlyGroups.length === 0) {
      return { rows: [], header: {} };
    }

    const monthKeys = [];
    const monthLabels = {};

    monthlyGroups.forEach((group) => {
      if (!group || !group.month_key) return;
      monthKeys.push(group.month_key);
      if (group.month_label) {
        monthLabels[group.month_key] = group.month_label;
      }
    });

    const uniqueMonthKeys = Array.from(new Set(monthKeys)).sort();

    const rowsMap = new Map();

    monthlyGroups.forEach((group) => {
      const monthKey = group.month_key;
      if (!monthKey || !group.items) return;

      group.items.forEach((item) => {
        if (!item) return;
        if (item.status === "paid") return;

        const label = item.category_name || item.title || "Sem categoria";
        const rowKey = label;

        const totalInstallments = Math.max(Number(item.total_installments || 1), 1);
        const amountNumber = Number(item.amount || 0) || 0;
        const monthlyAmount = amountNumber / totalInstallments;

        if (!rowsMap.has(rowKey)) {
          const baseRow = { label };
          uniqueMonthKeys.forEach((mk) => {
            baseRow[mk] = 0;
          });
          rowsMap.set(rowKey, baseRow);
        }

        const row = rowsMap.get(rowKey);
        row[monthKey] = Number(row[monthKey] || 0) + monthlyAmount;
      });
    });

    const rowsArray = Array.from(rowsMap.values());

    if (rowsArray.length === 0) {
      return { rows: [], header: {} };
    }

    const header = {
      label: { name: "Categoria / Compra" },
    };

    uniqueMonthKeys.forEach((mk) => {
      header[mk] = { name: monthLabels[mk] || mk };
    });

    return { rows: rowsArray, header };
  }, [monthlyGroups]);

  if (!rows || rows.length === 0) {
    return null;
  }

  return (
    <ExportExcel
      data={rows}
      header={header}
      name="faturas_pendentes"
    />
  );
}
