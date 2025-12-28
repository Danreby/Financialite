import React from "react";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";

export default function FaturaImportActions({ isLoading, hasPreview, onCancel, onConfirm }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <SecondaryButton type="button" onClick={onCancel} disabled={isLoading}>
        Cancelar
      </SecondaryButton>
      <PrimaryButton
        type="button"
        onClick={onConfirm}
        disabled={isLoading || !hasPreview}
      >
        {isLoading ? "Importando..." : "Confirmar importação"}
      </PrimaryButton>
    </div>
  );
}
