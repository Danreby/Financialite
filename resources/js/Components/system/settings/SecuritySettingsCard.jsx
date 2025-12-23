import React, { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function SecuritySettingsCard({ itemVariants }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.currentPassword) newErrors.currentPassword = 'Senha atual é obrigatória'
    if (!formData.newPassword) newErrors.newPassword = 'Nova senha é obrigatória'
    if (formData.newPassword && formData.newPassword.length < 8) {
      newErrors.newPassword = 'Nova senha deve ter no mínimo 8 caracteres'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não correspondem'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await axios.put(route('password.update'), {
        current_password: formData.currentPassword,
        password: formData.newPassword,
        password_confirmation: formData.confirmPassword,
      })
      toast.success('Senha alterada com sucesso!')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        toast.error('Erro ao alterar senha.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-[#0f0f0f] rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg
            className="w-5 h-5 text-rose-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Segurança
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Altere sua senha regularmente para manter sua conta segura
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div variants={itemVariants}>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Senha Atual
          </label>
          <input
            id="currentPassword"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              errors.currentPassword
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-rose-500 dark:border-gray-700'
            } bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 dark:focus:border-gray-600`}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nova Senha
          </label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              errors.newPassword
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-rose-500 dark:border-gray-700'
            } bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 dark:focus:border-gray-600`}
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Mínimo de 8 caracteres</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmar Nova Senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              errors.confirmPassword
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-rose-500 dark:border-gray-700'
            } bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 dark:focus:border-gray-600`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Atualizando...' : 'Alterar Senha'}
          </button>
        </motion.div>
      </form>
    </div>
  )
}
