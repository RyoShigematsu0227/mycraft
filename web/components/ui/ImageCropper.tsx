'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Button from './Button'

interface ImageCropperProps {
  imageSrc: string
  aspectRatio?: number
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageCropper({
  imageSrc,
  aspectRatio = 1,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspectRatio))
    },
    [aspectRatio]
  )

  const getCroppedImg = useCallback(async (): Promise<File | null> => {
    const image = imgRef.current
    if (!image || !completedCrop) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
            resolve(file)
          } else {
            resolve(null)
          }
        },
        'image/jpeg',
        0.9
      )
    })
  }, [completedCrop])

  const handleSave = async () => {
    const croppedFile = await getCroppedImg()
    if (croppedFile) {
      onCropComplete(croppedFile)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-background p-4 dark:bg-surface">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          画像をトリミング
        </h3>

        <div className="mb-4 flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            circularCrop={aspectRatio === 1}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[60vh]"
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>トリミングを適用</Button>
        </div>
      </div>
    </div>
  )
}
