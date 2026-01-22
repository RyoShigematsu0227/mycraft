'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PostImagesProps {
  images: { id: string; image_url: string; display_order: number }[]
}

export default function PostImages({ images }: PostImagesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

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
      <div className={`mt-3 grid gap-1 overflow-hidden rounded-xl ${gridClass}`}>
        {sortedImages.slice(0, 4).map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${
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
              className="object-cover transition hover:opacity-90"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setSelectedIndex(null)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {sortedImages.length > 1 && (
            <>
              <button
                className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
                }}
                disabled={selectedIndex === 0}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) =>
                    prev !== null && prev < sortedImages.length - 1 ? prev + 1 : prev
                  )
                }}
                disabled={selectedIndex === sortedImages.length - 1}
                style={{ right: '4rem' }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={sortedImages[selectedIndex].image_url}
              alt=""
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto object-contain"
              unoptimized
            />
          </div>

          <div className="absolute bottom-4 text-white">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        </div>
      )}
    </>
  )
}
