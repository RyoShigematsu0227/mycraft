import Image from 'next/image'
import Link from 'next/link'

interface WorldIconProps {
  worldId: string
  iconUrl?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLink?: boolean
  className?: string
}

const DEFAULT_WORLD_ICON = '/defaults/default-world-icon.png'

export default function WorldIcon({
  worldId,
  iconUrl,
  name,
  size = 'md',
  showLink = true,
  className = '',
}: WorldIconProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  }

  const imageSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  }

  const icon = (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 ${sizes[size]} ${className}`}
    >
      <Image
        src={iconUrl || DEFAULT_WORLD_ICON}
        alt={name}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="h-full w-full object-cover"
        unoptimized={iconUrl?.startsWith('http') ?? false}
      />
    </div>
  )

  if (showLink) {
    return (
      <Link href={`/worlds/${worldId}`} className="hover:opacity-80 transition-opacity">
        {icon}
      </Link>
    )
  }

  return icon
}
