import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "../common/Modal";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";
import FloatLabelField from "@/Components/common/inputs/FloatLabelField";
import { useNumericInput } from "@/Hooks/useNumericInput";

export default function BankForm({ isOpen, onClose, onSuccess }) {
	const [banks, setBanks] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleNumericKeyDown = useNumericInput();

	useEffect(() => {
		if (!isOpen) return;

		let cancelled = false;

		const loadBanks = async () => {
			try {
				const response = await axios.get(route("banks.list"));
				if (!cancelled) {
					setBanks(response.data || []);
				}
			} catch (error) {
				console.error(error);
				toast.error("Não foi possível carregar os bancos.");
			}
		};

		loadBanks();

		return () => {
			cancelled = true;
		};
	}, [isOpen]);
	const handleSubmit = (e) => {
		e.preventDefault();

		if (isSubmitting) return;
		setIsSubmitting(true);

		const formData = new FormData(e.currentTarget);
		const bankId = formData.get("bank_id")?.toString().trim();
		const dueDayRaw = formData.get("due_day")?.toString().trim();
		const formElement = e.currentTarget;

		toast.dismiss();

		if (!bankId) {
			toast.error("Selecione um banco.");
			formElement.elements.namedItem("bank_id")?.focus();
			setIsSubmitting(false);
			return;
		}

		let dueDay = null;
		if (dueDayRaw) {
			const parsed = parseInt(dueDayRaw, 10);
			if (Number.isNaN(parsed) || parsed < 1 || parsed > 31) {
				toast.error("Informe um dia de vencimento entre 1 e 31.");
				formElement.elements.namedItem("due_day")?.focus();
				setIsSubmitting(false);
				return;
			}
			dueDay = parsed;
		}

		axios
			.post(route("banks.attach"), { bank_id: bankId, due_day: dueDay })
			.then((response) => {
				toast.dismiss();
				const payload = response.data || {};
				if (payload.already_attached) {
					toast.info(payload.message || "Este banco já está vinculado ao usuário.");
				} else {
					toast.success("Banco vinculado com sucesso.");
				}
				formElement.reset();
				setIsSubmitting(false);
				if (onSuccess) onSuccess(payload.bank_user || payload);
				if (onClose) onClose();
			})
			.catch((error) => {
				toast.dismiss();
				setIsSubmitting(false);
				if (error.response && error.response.status === 422) {
					const data = error.response.data || {};
					const validationMessage =
						data.errors?.bank_id?.[0] || data.message || "Erro de validação ao vincular banco.";

					toast.error(validationMessage);
					formElement.elements.namedItem("bank_id")?.focus();
					return;
				}

				toast.error("Erro ao vincular banco.");
			});
	};

	return (
			<Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="Adicionar conta bancária">
				<form className="space-y-4" onSubmit={handleSubmit} noValidate>
					<div className="flex flex-col gap-1">
						{/* <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
							Banco
						</label> */}
						<select
							name="bank_id"
							className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
							defaultValue=""
						>
							<option value="">Selecione um banco</option>
							{banks.map((bank) => (
								<option key={bank.id} value={bank.id}>
									{bank.name}
								</option>
							))}
						</select>
					</div>

					<FloatLabelField
						id="due_day"
						name="due_day"
						type="number"
						label="Dia de vencimento do cartão (1 a 31)"
						inputProps={{
							min: 1,
							max: 31,
							inputMode: 'numeric',
							onKeyDown: handleNumericKeyDown,
							placeholder: 'Opcional. Ex: 10',
						}}
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
						Salvar
					</PrimaryButton>
				</div>
			</form>
		</Modal>
	);
}

