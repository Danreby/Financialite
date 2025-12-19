import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Fatura() {
	return (
		<AuthenticatedLayout>
			<Head title="Faturas" />

			<div className="max-w-5xl mx-auto">
				<h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-gray-100">
					Faturas
				</h1>
				<p className="text-sm text-gray-600 dark:text-gray-300">
					Página de listagem e gestão de faturas. Você pode evoluir este conteúdo
					depois com filtros, tabela de transações, etc.
				</p>
			</div>
		</AuthenticatedLayout>
	);
}
