import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "@/Components/common/Modal";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";
import FloatLabelField from "@/Components/common/inputs/FloatLabelField";

export default function CategoryForm({ isOpen, onClose, onSuccess, categories = [] }) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (isSubmitting) return;

		const form = event.currentTarget;
		const formData = new FormData(form);
		const name = formData.get("name")?.toString().trim();

		toast.dismiss();

		if (!name) {
			toast.error("Informe o nome da categoria.");
			form.elements.namedItem("name")?.focus();
			return;
		}

		const normalizedName = name.toLowerCase();
		const alreadyExists = (categories || []).some((category) => {
			if (!category || !category.name) return false;
			return category.name.toString().trim().toLowerCase() === normalizedName;
		});

		if (alreadyExists) {
			toast.error("Você já possui uma categoria com esse nome.");
			form.elements.namedItem("name")?.focus();
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await axios.post(route("categories.store"), { name });

			toast.success("Categoria criada com sucesso.");
			form.reset();
			setIsSubmitting(false);
			if (onSuccess) onSuccess(response.data || {});
			if (onClose) onClose();
		} catch (error) {
			setIsSubmitting(false);

			if (error.response && error.response.status === 422) {
				const errors = error.response.data?.errors || {};
				if (errors.name?.[0]) {
					toast.error(errors.name[0]);
					form.elements.namedItem("name")?.focus();
					return;
				}
			}

			toast.error("Erro ao criar categoria.");
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			maxWidth="sm"
			title="Nova categoria"
		>
				<form className="space-y-4" onSubmit={handleSubmit} noValidate>
					<FloatLabelField
						id="name"
						name="name"
						type="text"
						label="Nome da categoria"
						inputProps={{
							maxLength: 120,
							placeholder: 'Ex: Mercado, Lazer, Shopping',
						}}
						isRequired
					/>

				<div className="flex items-center justify-end gap-3 pt-2">
					<SecondaryButton
						type="button"
						onClick={onClose}
						className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					>
						Cancelar
					</SecondaryButton>
					<PrimaryButton type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Salvando..." : "Salvar"}
					</PrimaryButton>
				</div>
			</form>
		</Modal>
	);
}
