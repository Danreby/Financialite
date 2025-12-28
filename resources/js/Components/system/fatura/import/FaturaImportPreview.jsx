import React from "react";
import ScrollArea from "@/Components/common/ScrollArea";

export default function FaturaImportPreview({ hasPreview, headers, previewRows, rows }) {
  if (!hasPreview) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white/80 shadow-sm dark:border-gray-700 dark:bg-gray-950/60">
      <div className="border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-700 dark:border-gray-800 dark:text-gray-200">
        Pré-visualização das primeiras {previewRows.length} linhas
      </div>
      <ScrollArea maxHeightClassName="max-h-64">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
            {previewRows.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-gray-50/40 dark:bg-gray-900/40" : ""}
              >
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-2 py-1 text-[11px] text-gray-800 dark:text-gray-100 whitespace-nowrap max-w-xs truncate"
                    title={row[header] != null ? String(row[header]) : ""}
                  >
                    {row[header] != null ? String(row[header]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      <div className="flex justify-between bg-gray-50 px-3 py-2 text-[11px] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        <span>Total de linhas detectadas: {rows.length}</span>
        <span>Mostrando as primeiras {previewRows.length} linhas</span>
      </div>
    </div>
  );
}
