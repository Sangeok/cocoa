'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  description?: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  placeholder?: string
}

export default function Select({
  label,
  description,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = '선택',
}: SelectProps) {
  const selectedOption = options.find(option => option.value === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className="space-y-1">
          {label && (
            <Listbox.Label className="block text-sm font-medium text-gray-900 dark:text-white">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Listbox.Label>
          )}
          
          <div className="relative">
            <Listbox.Button
              className={clsx(
                'relative w-full cursor-default rounded-lg py-2.5 pl-3 pr-10 text-left',
                'bg-gray-100 dark:bg-gray-800',
                'hover:bg-gray-200 dark:hover:bg-gray-700',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-white/25',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                !value && 'text-gray-500 dark:text-gray-400'
              )}
            >
              <span className="block truncate text-gray-900 dark:text-white">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={clsx(
                  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg',
                  'bg-gray-100 dark:bg-gray-800 py-1',
                  'focus:outline-none shadow-lg',
                  'scrollbar-thin scrollbar-track-transparent dark:scrollbar-track-transparent scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600'
                )}
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active, selected }) =>
                      clsx(
                        'relative cursor-pointer select-none py-2 pl-3 pr-9',
                        active ? 'bg-gray-200 dark:bg-gray-700' : '',
                        selected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      )
                    }
                  >
                    {({ selected }) => (
                      <span className={clsx('block truncate', selected && 'font-semibold')}>
                        {option.label}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>

          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
    </Listbox>
  )
} 