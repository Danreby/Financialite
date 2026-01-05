// FILE: src/Pages/Auth/Login.jsx
import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { motion } from 'framer-motion'
import GuestLayout from '@/Layouts/GuestLayout'
import AuthCard from '@/Components/auth/AuthCard'
import AuthHeader from '@/Components/auth/AuthHeader'
import FormField from '@/Components/auth/FormField'
import PrimaryButton from '@/Components/common/buttons/PrimaryButton'
import EyeIcon from '@/Components/common/icons/EyeIcon'

export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  const [showPassword, setShowPassword] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    post(route('login'), { onFinish: () => reset('password') })
  }

  return (
    <GuestLayout>
      <Head title="Entrar" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto px-4"
      >
        <AuthCard>
          {/* <div className="mb-2">
            <AuthHeader
              title="Bem-vindo de volta"
              subtitle="Entre com sua conta para continuar"
            />
          </div> */}

          {status && (
            <div className="mb-3 text-sm font-medium text-emerald-400">
              {status}
            </div>
          )}

          <motion.form
            onSubmit={submit}
            className="space-y-6 px-4 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            <FormField
              id="email"
              label="E-mail"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              error={errors.email}
              autoComplete="username"
              autoFocus
              type="email"
            />

            <FormField
              id="password"
              label="Senha"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-200 focus:outline-none mt-3"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <EyeIcon type={showPassword ? 1 : 2} />
                </button>
              }
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="flex items-center select-none">
                <input
                  type="checkbox"
                  name="remember"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-transparent focus:ring-0 dark:border-gray-500"
                />
                <span className="ms-2 text-sm text-gray-300">Lembrar-me</span>
              </label>

              {canResetPassword && (
                <Link
                  href={route('password.request')}
                  className="text-sm underline text-gray-300 hover:text-white self-end"
                >
                  Esqueceu a senha?
                </Link>
              )}
            </div>

            <div>
              <PrimaryButton type="submit" disabled={processing} className="w-full">
                Entrar
              </PrimaryButton>
            </div>
          </motion.form>

          <div className="mt-6 border-t border-gray-800 pt-4 text-center text-sm text-gray-400 pb-4">
            <span>Não tem conta? </span>
            <Link href={route('register')} className="underline text-gray-200 ml-1">
              Cadastre-se
            </Link>
          </div>
        </AuthCard>
      </motion.div>
    </GuestLayout>
  )
}