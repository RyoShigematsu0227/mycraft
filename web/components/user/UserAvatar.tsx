import Image from 'next/image'
import Link from 'next/link'

interface UserAvatarProps {
  userId: string
  avatarUrl?: string | null
  displayName: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showLink?: boolean
  className?: string
}

const DEFAULT_AVATAR = '/defaults/default-avatar.svg'

export default function UserAvatar({
  userId,
  avatarUrl,
  displayName,
  size = 'md',
  showLink = true,
  className = '',
}: UserAvatarProps) {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-24 w-24',
  }

  const imageSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96,
  }

  const avatar = (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${sizes[size]} ${className}`}
    >
      <Image
        src={avatarUrl || DEFAULT_AVATAR}
        alt={displayName}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="h-full w-full object-cover"
        unoptimized={avatarUrl?.startsWith('http') ?? false}
      />
    </div>
  )

  if (showLink) {
    return (
      <Link href={`/@${userId}`} className="hover:opacity-80 transition-opacity">
        {avatar}
      </Link>
    )
  }

  return avatar
}
