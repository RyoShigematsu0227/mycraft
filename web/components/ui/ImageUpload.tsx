'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import ImageCropper from './ImageCropper'

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File | null) => void
  onRemove?: () => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  placeholder?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  enableCrop?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  accept = 'image/*',
  maxSize = 5,
  className = '',
  placeholder = '画像をアップロード',
  aspectRatio = 'auto',
  enableCrop = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<string | null>(null)

  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  }

  const cropAspectRatios = {
    square: 1,
    video: 16 / 9,
    auto: undefined,
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)

    if (!file) {
      onChange(null)
      setPreview(null)
      return
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ファイルサイズは${maxSize}MB以下にしてください`)
      return
    }

    // If cropping is enabled, open cropper
    if (enableCrop && aspectRatio !== 'auto') {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCropSource(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // Create preview without cropping
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onChange(file)
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(croppedFile)
    onChange(croppedFile)
    setCropSource(null)
  }

  const handleCropCancel = () => {
    setCropSource(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    setError(null)
    onChange(null)
    onRemove?.()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const displayImage = preview || value

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {displayImage ? (
        <div
          className={`group relative cursor-pointer overflow-hidden rounded-lg ${aspectRatios[aspectRatio]} ${aspectRatio === 'auto' ? 'min-h-32' : ''}`}
          onClick={handleClick}
        >
          <Image
            src={displayImage}
            alt="Preview"
            fill
            className="object-cover transition group-hover:opacity-80"
            unoptimized
          />
          {/* Change overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
            <span className="text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
              変更
            </span>
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-surface transition hover:border-gray-400 hover:bg-surface dark:border-gray-600 dark:bg-surface dark:hover:border-gray-500 dark:hover:bg-gray-700 ${aspectRatios[aspectRatio]} ${aspectRatio === 'auto' ? 'min-h-32 py-8' : ''}`}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">{placeholder}</span>
          </div>
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Crop modal */}
      {cropSource && (
        <ImageCropper
          imageSrc={cropSource}
          aspectRatio={cropAspectRatios[aspectRatio]}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
