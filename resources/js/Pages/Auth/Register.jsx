// FILE: src/Pages/Auth/Register.jsx
import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { motion } from 'framer-motion'
import GuestLayout from '@/Layouts/GuestLayout'
import AuthCard from '@/Components/auth/AuthCard'
import AuthHeader from '@/Components/auth/AuthHeader'
import FormField from '@/Components/auth/FormField'
import PrimaryButton from '@/Components/common/buttons/PrimaryButton'
import EyeIcon from '@/Components/common/icons/EyeIcon'

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    })
  }

  return (
    <GuestLayout>
      <Head title="Criar conta" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto px-4"
      >
        <AuthCard>
          <div className="mb-2 pt-2 px-2">
            <AuthHeader title="Criar conta" subtitle="Cadastre-se para começar" />
          </div>

          <motion.form
            onSubmit={submit}
            className="space-y-6 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            <FormField
              id="name"
              label="Nome"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              error={errors.name}
              autoComplete="name"
              autoFocus
              type="text"
            />

            <FormField
              id="email"
              label="E-mail"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              error={errors.email}
              autoComplete="username"
              type="email"
            />

            <FormField
              id="password"
              label="Senha"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              error={errors.password}
              autoComplete="new-password"
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

            <FormField
              id="password_confirmation"
              label="Confirmar senha"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              error={errors.password_confirmation}
              autoComplete="new-password"
              type={showPasswordConfirmation ? 'text' : 'password'}
              rightElement={
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirmation((prev) => !prev)
                  }
                  className="text-gray-400 hover:text-gray-200 focus:outline-none mt-3"
                  aria-label={
                    showPasswordConfirmation
                      ? 'Ocultar confirmação de senha'
                      : 'Mostrar confirmação de senha'
                  }
                  title={
                    showPasswordConfirmation
                      ? 'Ocultar confirmação de senha'
                      : 'Mostrar confirmação de senha'
                  }
                >
                  <EyeIcon type={showPasswordConfirmation ? 1 : 2} />
                </button>
              }
            />

            <div>
              <PrimaryButton type="submit" disabled={processing} className="w-full">
                Cadastrar
              </PrimaryButton>
            </div>
          </motion.form>

          <div className="mt-6 border-t border-gray-800 pt-4 text-center text-sm text-gray-400 pb-4">
            <span>Já tem conta? </span>
            <Link href={route('login')} className="underline text-gray-200 ml-1">
              Entrar
            </Link>
          </div>
        </AuthCard>
      </motion.div>
    </GuestLayout>
  )
}
