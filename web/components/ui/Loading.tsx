interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
  text?: string
}

export default function Loading({
  size = 'md',
  className = '',
  fullScreen = false,
  text,
}: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const borderSizes = {
    sm: 'border-2',
    md: 'border-[3px]',
    lg: 'border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 animate-pulse rounded-full bg-accent/20 blur-md ${sizes[size]}`}
        />

        {/* Spinner ring */}
        <div
          className={`relative animate-spin rounded-full ${borderSizes[size]} border-accent/30 border-t-accent ${sizes[size]} ${className}`}
        />
      </div>
      {text && <span className="text-sm font-medium text-muted">{text}</span>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="relative">
          {/* Large background glow */}
          <div className="absolute -inset-8 animate-pulse rounded-full bg-gradient-to-br from-accent/10 to-accent-secondary/10 blur-2xl" />
          {spinner}
        </div>
      </div>
    )
  }

  return <div className="flex justify-center py-8">{spinner}</div>
}
