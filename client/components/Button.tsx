'use client'

import { Button as HeadlessButton } from '@headlessui/react'
import { clsx } from 'clsx'
import { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className
}: ButtonProps) {
  const variants = {
    primary: 'bg-gray-700 text-white hover:bg-gray-600',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    danger: 'bg-red-600 text-white hover:bg-red-500'
  }

  const sizes = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-1.5 px-3 text-sm/6',
    lg: 'py-2 px-4 text-base'
  }

  return (
    <HeadlessButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-2 rounded-md font-semibold',
        'shadow-inner shadow-white/10',
        'focus:outline-none focus-visible:outline-2 focus-visible:outline-white/25',
        'transition-colors duration-200',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        fullWidth && 'w-full justify-center',
        className
      )}
    >
      {children}
    </HeadlessButton>
  )
} 