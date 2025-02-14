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
  min?: number
  max?: number
  error?: string
}

export default function Input({
  label,
  description,
  placeholder,
  type = 'text',
  value,
  onChange,
  required = false,
  className,
  min,
  max,
  error
}: InputProps) {
  const isInvalid = type === 'number' && (
    (min !== undefined && Number(value) < min) ||
    (max !== undefined && Number(value) > max)
  );

  return (
    <Field className={clsx('w-full', className)}>
      <Label className="text-sm/6 font-medium text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <Description className="mt-1 text-sm/6 text-gray-500 dark:text-white/50">
          {description}
        </Description>
      )}
      
      <HeadlessInput
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className={clsx(
          'mt-3 block w-full rounded-lg border',
          isInvalid 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-300 dark:border-none',
          'bg-white dark:bg-white/5 py-1.5 px-3 text-sm/6',
          'text-gray-900 dark:text-white',
          'focus:outline-none focus:ring-2',
          isInvalid 
            ? 'focus:ring-red-500 dark:focus:ring-red-500/25' 
            : 'focus:ring-gray-500 dark:focus:ring-white/25',
          'placeholder:text-gray-400 dark:placeholder:text-white/30',
          'disabled:opacity-50'
        )}
      />
      
      {isInvalid && (
        <p className="mt-1 text-sm text-red-500">
          {error || (
            max !== undefined && Number(value) > max 
              ? `최대 ${max.toLocaleString()}까지 입력 가능합니다` 
              : min !== undefined && Number(value) < min
                ? `최소 ${min.toLocaleString()}부터 입력 가능합니다`
                : '유효하지 않은 값입니다'
          )}
        </p>
      )}
    </Field>
  )
} 