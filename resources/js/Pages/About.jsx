import React from 'react'
import { Head } from '@inertiajs/react'
import { motion } from 'framer-motion'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { FeatureCard, SocialCard, TechCard } from '@/Components/system/about/AboutCards'

export default function About() {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: 'easeOut' },
		},
	}

	const featureVariants = {
		hidden: { opacity: 0, scale: 0.95 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.4, ease: 'easeOut' },
		},
	}

	const features = [
		{
			icon: '📊',
			title: 'Acompanhe Faturas',
			description: 'Controle suas faturas mês a mês com pagamentos organizados',
		},
		{
			icon: '💳',
			title: 'Registre Transações',
			description: 'Compras em crédito, débito, recorrentes e parceladas',
		},
		{
			icon: '🏦',
			title: 'Organize Contas',
			description: 'Gerencie contas bancárias e categorias para relatórios claros',
		},
		{
			icon: '📈',
			title: 'Painel Visual',
			description: 'Visão geral completa de suas finanças mensais',
		},
		{
			icon: '📥',
			title: 'Exporte Dados',
			description: 'Baixe planilhas Excel com dados das próximas faturas',
		},
		{
			icon: '⚡',
			title: 'Interface Rápida',
			description: 'Aplicação leve e responsiva para qualquer dispositivo',
		},
	]

	const socialLinks = [
		{
			label: 'Portfólio',
			url: 'https://danreby.github.io/danreby-portifolio/',
			icon: '🌐',
		},
		{
			label: 'GitHub',
			url: 'https://github.com/Danreby',
			icon: '💻',
		},
		{
			label: 'LinkedIn',
			url: 'https://www.linkedin.com/in/bernardo-rolim-aa6802213/',
			icon: '🔗',
		},
	]

	return (
		<AuthenticatedLayout>
			<Head title="Sobre" />
			<motion.div
				className="w-full max-w-6xl mx-auto space-y-12 sm:space-y-14 px-3 sm:px-4 lg:px-6"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<motion.header className="pt-1 sm:pt-2 space-y-4" variants={itemVariants}>
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1, duration: 0.6 }}
						className="mb-3"
					>
						<span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl shadow-md text-white">
							💰
						</span>
					</motion.div>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-gray-100">
						Financialite
					</h1>
					<p className="mt-1 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
						Seu gerenciador financeiro pessoal inteligente e moderno
					</p>
					<p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
						Desenvolvido por{' '}
						<a
							href="https://danreby.github.io/danreby-portifolio/"
							className="font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
							target="_blank"
							rel="noopener noreferrer"
						>
							Bernardo Santos Rolim
						</a>
						, um desenvolvedor full-stack apaixonado por aplicações web modernas. Uma ferramenta simples
						e eficiente para o gerenciamento de faturas, transações e despesas.
					</p>
				</motion.header>

				<motion.section className="mb-4" variants={itemVariants}>
					<h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
						Recursos Disponíveis
					</h2>
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{features.map((feature, index) => (
							<FeatureCard
								key={index}
								icon={feature.icon}
								title={feature.title}
								description={feature.description}
								variants={featureVariants}
							/>
						))}
					</motion.div>
				</motion.section>

				<motion.section
					className="mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-6 sm:p-8 lg:p-10 ring-1 ring-blue-200/50 dark:ring-blue-800/30"
					variants={itemVariants}
				>
					<h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
						Sobre o Projeto
					</h2>
					<div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
						<p className="text-base sm:text-lg">
							Financialite é uma aplicação em constante evolução, desenvolvida com as tecnologias
							mais modernas para garantir uma experiência de usuário excepcional. Novos recursos são
							adicionados regularmente, refinando fluxos conforme o uso diário.
						</p>
						<p className="text-base sm:text-lg">
							<span className="font-semibold text-blue-600 dark:text-blue-400">100% Pessoal:</span>{' '}
							Este projeto não será monetizado, não contém anúncios e seus dados estão seguros. É
							desenvolvido puramente para fins pessoais e não comerciais.
						</p>
						<p className="text-base sm:text-lg">
							<span className="font-semibold text-green-600 dark:text-green-400">Código Aberto:</span>{' '}
							Sinta-se à vontade para explorar o repositório, contribuir com sugestões ou reportar
							bugs através do GitHub.
						</p>
					</div>
				</motion.section>

				<motion.section className="mb-4" variants={itemVariants}>
					<h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
						Conecte-se Comigo
					</h2>
					<motion.div
						className="grid grid-cols-1 sm:grid-cols-3 gap-4"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{socialLinks.map((link, index) => (
							<SocialCard
								key={index}
								icon={link.icon}
								label={link.label}
								url={link.url}
								variants={featureVariants}
							/>
						))}
					</motion.div>
				</motion.section>

				<motion.section
					className="bg-white dark:bg-[#0b0b0b] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md ring-1 ring-black/5 dark:ring-white/10"
					variants={itemVariants}
				>
					<h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
						Tecnologias Utilizadas
					</h2>
					<motion.div
						className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{[
							{ name: 'Laravel', icon: '🚀' },
							{ name: 'React', icon: '⚛️' },
							{ name: 'Tailwind CSS', icon: '🎨' },
							{ name: 'Inertia.js', icon: '🔗' },
							{ name: 'MySQL', icon: '🗄️' },
							{ name: 'Vite', icon: '⚡' },
							{ name: 'Framer Motion', icon: '✨' },
							{ name: 'JavaScript', icon: '📝' },
						].map((tech, index) => (
							<TechCard
								key={index}
								icon={tech.icon}
								name={tech.name}
								variants={featureVariants}
							/>
						))}
					</motion.div>
				</motion.section>
			</motion.div>
		</AuthenticatedLayout>
	)
}

