'use client'

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'

interface DialogProps {
  title: string
  description: string
  buttonText?: string
  closeButtonText?: string
  form?: {
    initialValue: string
    maxLength: number
    onSubmit: (value: string) => void
  }
}

export default function CustomDialog({ 
  title, 
  description, 
  buttonText = "Open Dialog", 
  closeButtonText = "Got it, thanks!",
  form,
}: DialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(form?.initialValue || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form) {
      form.onSubmit(inputValue)
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
      >
        <PencilIcon className="h-4 w-4" />
      </button>

      <Dialog 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        as="div" 
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                {title}
              </DialogTitle>
              
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {description}
                </p>
              </div>

              {form && (
                <form onSubmit={handleSubmit} className="mt-4">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 
                             border border-gray-300 dark:border-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             text-gray-900 dark:text-white"
                    maxLength={form.maxLength}
                  />
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      {closeButtonText}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 
                               hover:bg-green-700 rounded-lg"
                    >
                      변경
                    </button>
                  </div>
                </form>
              )}

              {!form && (
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    {closeButtonText}
                  </button>
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
} 