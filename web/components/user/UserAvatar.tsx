import Image from 'next/image'
import Link from 'next/link'

interface UserAvatarProps {
  userId: string
  avatarUrl?: string | null
  displayName: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showLink?: boolean
  showGlow?: boolean
  className?: string
}

const DEFAULT_AVATAR = '/defaults/default-avatar.svg'

export default function UserAvatar({
  userId,
  avatarUrl,
  displayName,
  size = 'md',
  showLink = true,
  showGlow = false,
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

  const ringSizes = {
    xs: 'ring-1',
    sm: 'ring-2',
    md: 'ring-2',
    lg: 'ring-2',
    xl: 'ring-[3px]',
    '2xl': 'ring-[3px]',
  }

  const glowSizes = {
    xs: '-inset-0.5',
    sm: '-inset-0.5',
    md: '-inset-1',
    lg: '-inset-1',
    xl: '-inset-1.5',
    '2xl': '-inset-2',
  }

  const avatar = (
    <div className={`group/avatar relative shrink-0 ${className}`}>
      {/* Glow effect */}
      {showGlow && (
        <div className={`absolute ${glowSizes[size]} rounded-full bg-gradient-to-br from-accent/50 to-accent-secondary/50 opacity-0 blur transition-opacity duration-300 group-hover/avatar:opacity-100`} />
      )}

      {/* Avatar container */}
      <div
        className={`relative overflow-hidden rounded-full bg-gray-200 ${ringSizes[size]} ring-surface transition-all duration-300 group-hover/avatar:ring-accent/30 dark:bg-gray-700 ${sizes[size]}`}
      >
        <Image
          src={avatarUrl || DEFAULT_AVATAR}
          alt={displayName}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
          unoptimized={avatarUrl?.startsWith('http') ?? false}
        />
      </div>

      {/* Online indicator placeholder - can be enabled via prop in future */}
      {/* <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-surface" /> */}
    </div>
  )

  if (showLink) {
    return (
      <Link href={`/users/${userId}`} className="block">
        {avatar}
      </Link>
    )
  }

  return avatar
}
