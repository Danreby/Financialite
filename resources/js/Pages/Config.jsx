import React from 'react'
import { Head, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { motion } from 'framer-motion'
import ProfileSettingsCard from '@/Components/system/settings/ProfileSettingsCard'
import SecuritySettingsCard from '@/Components/system/settings/SecuritySettingsCard'

export default function Config() {
  const { auth } = usePage().props
  const user = auth.user

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  }

  return (
    <AuthenticatedLayout>
      <Head title="Configurações" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e preferências de segurança
          </p>
        </motion.div>

        {/* Profile Settings Card */}
        <motion.div variants={itemVariants}>
          <ProfileSettingsCard user={user} itemVariants={itemVariants} />
        </motion.div>

        {/* Security Settings Card */}
        <motion.div variants={itemVariants}>
          <SecuritySettingsCard itemVariants={itemVariants} />
        </motion.div>
      </motion.div>
    </AuthenticatedLayout>
  )
}
