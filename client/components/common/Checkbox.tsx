'use client'

import { Checkbox as HeadlessCheckbox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/16/solid'
import { clsx } from 'clsx'

interface CheckboxProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export default function Checkbox({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  required = false,
  className
}: CheckboxProps) {
  return (
    <HeadlessCheckbox
      as="label"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={clsx('flex items-start gap-3 group cursor-pointer', className)}
    >
      <div
        className={clsx(
          'relative size-5 shrink-0 rounded',
          'bg-white dark:bg-white/5',
          'ring-1 ring-inset ring-gray-300 dark:ring-white/15',
          'data-[checked]:bg-gray-900 dark:data-[checked]:bg-white',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-white/25',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
      >
        <CheckIcon 
          className={clsx(
            'hidden size-3 fill-white dark:fill-gray-900',
            'group-data-[checked]:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
          )} 
        />
      </div>
      {(label || description) && (
        <span className="cursor-pointer">
          {label && (
            <span className="block text-sm font-medium text-gray-900 dark:text-white">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          )}
          {description && (
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </span>
      )}
    </HeadlessCheckbox>
  )
} 