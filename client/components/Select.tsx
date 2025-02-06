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
            <Listbox.Label className="block text-sm font-medium text-white">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Listbox.Label>
          )}
          
          <div className="relative">
            <Listbox.Button
              className={clsx(
                'relative w-full cursor-default rounded-lg bg-gray-800 py-2.5 pl-3 pr-10 text-left',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                !value && 'text-gray-400' // Placeholder color
              )}
            >
              <span className="block truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
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
                  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800',
                  'py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
                  'scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700'
                )}
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active, selected }) =>
                      clsx(
                        'relative cursor-pointer select-none py-2 pl-3 pr-9',
                        active ? 'bg-gray-700' : '',
                        selected ? 'text-white' : 'text-gray-300'
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
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}
    </Listbox>
  )
} 