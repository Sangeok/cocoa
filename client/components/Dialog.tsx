'use client'

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'

interface DialogProps {
  title: string
  description: string
  buttonText?: string
  closeButtonText?: string
}

export default function CustomDialog({ 
  title, 
  description, 
  buttonText = "Open Dialog", 
  closeButtonText = "Got it, thanks!" 
}: DialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={open}
        className="rounded-md bg-gray-100 dark:bg-gray-800 py-2 px-4 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        {buttonText}
      </button>

      <Dialog 
        open={isOpen} 
        onClose={close}
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

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                  onClick={close}
                >
                  {closeButtonText}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
} 