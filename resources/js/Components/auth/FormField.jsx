import React from 'react'
import InputError from '@/Components/InputError'
import FloatLabelField from '@/Components/common/inputs/FloatLabelField'

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
  autoFocus,
  required,
  helperText,
  rightElement,
}) {
  return (
    <div className="space-y-1.5">
      <FloatLabelField
        id={id}
        name={id}
        type={type}
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        isRequired={required}
        containerClassName="w-full"
        rightElement={rightElement}
        inputProps={{
          autoComplete,
          autoFocus,
        }}
      />

      <InputError message={error} className="text-xs mt-0.5" />
      {!error && helperText && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  )
}
