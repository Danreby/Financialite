import React from "react";
import ExportExcel from "@/Components/system/excel/ExportExcel";

export default function FaturaImportIntro({ templateRows, templateHeader }) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Importe várias faturas de uma só vez usando um arquivo
          Excel. Primeiro, baixe o modelo com as colunas corretas ou
          utilize um arquivo que já contenha um cabeçalho na primeira
          linha com os seguintes nomes (em inglês, exatamente como
          abaixo):
        </p>
        <p className="rounded-md bg-gray-50 px-3 py-2 text-xs font-mono text-gray-700 dark:bg-gray-900 dark:text-gray-200">
          title, description, amount, type, status,
          total_installments, current_installment, is_recurring,
          bank_user_name, category_name
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Campos de conta e categoria são opcionais, mas quando
          preenchidos devem usar o <strong>nome exato</strong> das
          contas e categorias já cadastradas para garantir a
          vinculação correta.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50/60 p-3 text-center dark:border-indigo-500/50 dark:bg-indigo-950/40">
        <p className="mb-2 text-xs font-medium text-indigo-900 dark:text-indigo-100">
          Baixar modelo pronto para preenchimento
        </p>
        <div className="flex justify-center">
          <ExportExcel
            data={templateRows}
            header={templateHeader}
            name="modelo_importacao_faturas"
            currencyColumns={["amount"]}
          />
        </div>
        <p className="mt-2 text-[11px] text-indigo-900/80 dark:text-indigo-200/80">
          O modelo inclui uma linha de exemplo para orientar o
          preenchimento de cada coluna.
        </p>
      </div>
    </div>
  );
}
