import React from 'react'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import InputError from '@/Components/InputError'

export default function FormField({ id, label, type = 'text', value, onChange, error, autoComplete, autoFocus }) {
  return (
    <div>
      <InputLabel htmlFor={id} value={label} className="dark:text-gray-200 text-sm" />

      <TextInput
        id={id}
        type={type}
        name={id}
        value={value}
        className="mt-1 block w-full dark:bg-[#0f0f0f] dark:border-gray-700 dark:text-gray-100"
        autoComplete={autoComplete}
        isFocused={autoFocus}
        onChange={onChange}
      />

      <InputError message={error} className="mt-2" />
    </div>
  )
}
