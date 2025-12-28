import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx-js-style";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "@/Components/common/Modal";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";
import ExportExcel from "@/Components/system/excel/ExportExcel";

export default function FaturaImportModal({ isOpen, onClose, onImported }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const templateHeader = useMemo(
    () => ({
      title: { name: "title" },
      description: { name: "description" },
      amount: { name: "amount" },
      type: { name: "type" },
      status: { name: "status" },
      total_installments: { name: "total_installments" },
      current_installment: { name: "current_installment" },
      is_recurring: { name: "is_recurring" },
      bank_user_name: { name: "bank_user_name" },
      category_name: { name: "category_name" },
    }),
    []
  );

  const templateRows = useMemo(
    () => [
      {
        title: "Compra supermercado",
        description: "Mercado do bairro",
        amount: 250.75,
        type: "debit",
        status: "paid",
        total_installments: 1,
        current_installment: 1,
        is_recurring: false,
        bank_user_name: "Nome da conta (opcional)",
        category_name: "Nome da categoria (opcional)",
      },
    ],
    []
  );

  const resetState = () => {
    setFileName("");
    setRows([]);
    setHeaders([]);
    setIsLoading(false);
  };

  const handleClose = () => {
    if (isLoading) return;
    resetState();
    onClose?.();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    toast.dismiss();

    try {
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (file.type && !allowedTypes.includes(file.type)) {
        toast.error("Selecione um arquivo Excel (.xlsx, .xls ou .csv).");
        setIsLoading(false);
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          if (!sheetData || sheetData.length < 2) {
            toast.error("O arquivo não contém dados suficientes.");
            setIsLoading(false);
            return;
          }

          const [headerRow, ...dataRows] = sheetData;
          const normalizedHeaders = headerRow.map((h) => String(h || "").trim());

          if (!normalizedHeaders.includes("title") || !normalizedHeaders.includes("amount") || !normalizedHeaders.includes("type")) {
            toast.error("O arquivo deve conter pelo menos as colunas: title, amount e type.");
            setIsLoading(false);
            return;
          }

          const parsedRows = dataRows
            .filter((row) => row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ""))
            .map((row) => {
              const obj = {};
              normalizedHeaders.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            });

          setHeaders(normalizedHeaders);
          setRows(parsedRows);
          setIsLoading(false);
          toast.success("Arquivo carregado. Revise os dados antes de confirmar.");
        } catch (error) {
          console.error(error);
          toast.error("Não foi possível ler o arquivo Excel.");
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Erro ao ler o arquivo.");
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar o arquivo.");
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!rows || rows.length === 0) {
      toast.error("Nenhum dado para importar.");
      return;
    }

    setIsLoading(true);
    toast.dismiss();

    try {
      const response = await axios.post(route("faturas.import"), {
        rows,
      });

      const payload = response.data || {};
      const importedCount = Number(payload.imported_count || 0);

      if (importedCount > 0) {
        toast.success(`${importedCount} fatura(s) importada(s) com sucesso.`);
      } else {
        toast.info("Nenhuma fatura foi importada.");
      }

      if (onImported) onImported(payload);
      resetState();
      onClose?.();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erro ao importar faturas.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasPreview = headers.length > 0 && rows.length > 0;
  const previewRows = hasPreview ? rows.slice(0, 10) : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      title="Importar faturas via Excel"
    >
      <div className="space-y-6">
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
              titulo, descrição, valor, tipo, status,
              total de parcelas, parcela atual, recorrente,
              nome da conta, nome da categoria
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

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">
            Selecione o arquivo Excel para importar
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-200"
          />
          {fileName && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Arquivo selecionado: {fileName}
            </span>
          )}
        </div>

        {hasPreview && (
          <div className="rounded-lg border border-gray-200 bg-white/80 shadow-sm dark:border-gray-700 dark:bg-gray-950/60">
            <div className="border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-700 dark:border-gray-800 dark:text-gray-200">
              Pré-visualização das primeiras {previewRows.length} linhas
            </div>
            <div className="max-h-64 overflow-auto">
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
                    <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50/40 dark:bg-gray-900/40" : ""}>
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
            </div>
            <div className="flex justify-between bg-gray-50 px-3 py-2 text-[11px] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <span>Total de linhas detectadas: {rows.length}</span>
              <span>Mostrando as primeiras {previewRows.length} linhas</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <SecondaryButton
            type="button"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={handleConfirmImport}
            disabled={isLoading || !hasPreview}
          >
            {isLoading ? "Importando..." : "Confirmar importação"}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}
