'use client'

import { useCallback, useState } from 'react'
import { clsx } from 'clsx'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FileInputProps {
  label: string
  onChange: (file: File | null) => void
  accept?: string
  maxSize?: number // MB 단위
  description?: string
  required?: boolean
  className?: string
  dimensions?: {
    width: number
    height: number
  }
}

export default function FileInput({
  label,
  onChange,
  accept = 'image/*',
  maxSize = 5, // 기본 5MB
  description,
  required = false,
  className,
  dimensions
}: FileInputProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File | null) => {
    if (!file) {
      setFile(null)
      onChange(null)
      return
    }

    // 파일 크기 검사
    if (file.size > maxSize * 1024 * 1024) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`)
      return
    }

    // 이미지 차원 검사
    if (dimensions && file.type.startsWith('image/')) {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        if (img.width !== dimensions.width || img.height !== dimensions.height) {
          setError(`이미지 크기는 ${dimensions.width}x${dimensions.height}px 이어야 합니다.`)
          return
        }
        setFile(file)
        onChange(file)
        setError(null)
      }
      return
    }

    setFile(file)
    onChange(file)
    setError(null)
  }, [maxSize, dimensions, onChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  return (
    <div className={className}>
      <div className="flex justify-between items-baseline mb-2">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {file && (
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400"
          >
            삭제
          </button>
        )}
      </div>

      <div
        onDragEnter={handleDrag}
        className={clsx(
          'relative rounded-lg border-2 border-dashed',
          'transition-colors duration-200',
          dragActive
            ? 'border-gray-500 bg-gray-50 dark:border-gray-400 dark:bg-gray-800/50'
            : 'border-gray-300 dark:border-gray-700',
          error && 'border-red-500 dark:border-red-500'
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="p-4 text-center">
          {file ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">클릭</span> 또는 파일을 여기로 드래그하세요
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      {description && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  )
} 