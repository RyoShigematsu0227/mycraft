import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const DEFAULT_AVATAR = '/defaults/default-avatar.svg'

export default function Avatar({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const imageSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${sizes[size]} ${className}`}
    >
      <Image
        src={src || DEFAULT_AVATAR}
        alt={alt}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="h-full w-full object-cover"
        unoptimized={src?.startsWith('http') ?? false}
      />
    </div>
  )
}
