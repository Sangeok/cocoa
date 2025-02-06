'use client'

import { Description, Field, Input as HeadlessInput, Label } from '@headlessui/react'
import { clsx } from 'clsx'

interface InputProps {
  label: string
  description?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  className?: string
}

export default function Input({
  label,
  description,
  placeholder,
  type = 'text',
  value,
  onChange,
  required = false,
  className
}: InputProps) {
  return (
    <Field className={clsx('w-full', className)}>
      <Label className="text-sm/6 font-medium text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <Description className="mt-1 text-sm/6 text-white/50">
          {description}
        </Description>
      )}
      
      <HeadlessInput
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={clsx(
          'mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white',
          'focus:outline-none focus:ring-2 focus:ring-white/25',
          'placeholder:text-white/30',
          'disabled:opacity-50'
        )}
      />
    </Field>
  )
} 