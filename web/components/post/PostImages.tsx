'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PostImagesProps {
  images: { id: string; image_url: string; display_order: number }[]
}

export default function PostImages({ images }: PostImagesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedIndex(null)
      setIsClosing(false)
    }, 200)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft' && selectedIndex > 0) setSelectedIndex(selectedIndex - 1)
      if (e.key === 'ArrowRight' && selectedIndex < images.length - 1) setSelectedIndex(selectedIndex + 1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, images.length])

  if (images.length === 0) return null

  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order)

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2',
    4: 'grid-cols-2',
  }[Math.min(images.length, 4)]

  return (
    <>
      <div className={`grid gap-0.5 ${gridClass}`}>
        {sortedImages.slice(0, 4).map((image, index) => (
          <button
            key={image.id}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSelectedIndex(index)
            }}
            className={`pointer-events-auto cursor-pointer group/img relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${
              images.length === 3 && index === 0 ? 'row-span-2' : ''
            }`}
            style={{
              aspectRatio: images.length === 1 ? '16/9' : images.length === 3 && index === 0 ? '1/1' : '1/1',
            }}
          >
            <Image
              src={image.image_url}
              alt=""
              fill
              className="object-cover transition-all duration-300 group-hover/img:scale-105"
              unoptimized
            />
            {/* Hover overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/img:opacity-100" />

            {/* Expand icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/img:opacity-100">
              <div className="rounded-full bg-black/50 p-2 backdrop-blur-sm">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>

            {/* Show count badge on last image if more than 4 */}
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-2xl font-bold text-white">+{images.length - 4}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Lightbox */}
      {selectedIndex !== null && (
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-200 ${
            isClosing ? 'bg-black/0' : 'bg-black/95'
          }`}
          onClick={handleClose}
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 backdrop-blur-sm" />

          {/* Close button */}
          <button
            className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
            onClick={handleClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {sortedImages.length > 1 && (
            <>
              <button
                className="absolute left-4 z-10 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
                }}
                disabled={selectedIndex === 0}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 z-10 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) =>
                    prev !== null && prev < sortedImages.length - 1 ? prev + 1 : prev
                  )
                }}
                disabled={selectedIndex === sortedImages.length - 1}
                style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Main image container */}
          <div
            className={`relative max-h-[85vh] max-w-[90vw] transition-all duration-200 ${
              isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={sortedImages[selectedIndex].image_url}
              alt=""
              width={1400}
              height={900}
              className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl"
              unoptimized
              priority
            />
          </div>

          {/* Image counter with thumbnails */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
            {/* Thumbnail strip for multiple images */}
            {sortedImages.length > 1 && sortedImages.length <= 6 && (
              <div className="flex gap-2 rounded-full bg-black/50 p-2 backdrop-blur-md">
                {sortedImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIndex(idx)
                    }}
                    className={`relative h-10 w-10 cursor-pointer overflow-hidden rounded-md transition-all ${
                      idx === selectedIndex
                        ? 'ring-2 ring-white scale-110'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Simple counter for many images */}
            {sortedImages.length > 6 && (
              <div className="rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                {selectedIndex + 1} / {sortedImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
