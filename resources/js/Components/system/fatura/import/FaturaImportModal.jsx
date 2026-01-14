import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx-js-style";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "@/Components/common/Modal";
import FaturaImportIntro from "@/Components/system/fatura/import/FaturaImportIntro";
import FaturaImportFileInput from "@/Components/system/fatura/import/FaturaImportFileInput";
import FaturaImportPreview from "@/Components/system/fatura/import/FaturaImportPreview";
import FaturaImportActions from "@/Components/system/fatura/import/FaturaImportActions";

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
      const response = await axios.post(route("transacoes.import"), {
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
        <FaturaImportIntro
          templateRows={templateRows}
          templateHeader={templateHeader}
        />

        <FaturaImportFileInput
          isLoading={isLoading}
          fileName={fileName}
          onChange={handleFileChange}
        />

        <FaturaImportPreview
          hasPreview={hasPreview}
          headers={headers}
          previewRows={previewRows}
          rows={rows}
        />

        <FaturaImportActions
          isLoading={isLoading}
          hasPreview={hasPreview}
          onCancel={handleClose}
          onConfirm={handleConfirmImport}
        />
      </div>
    </Modal>
  );
}
