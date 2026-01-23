interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {icon && (
        <div className="relative mb-6">
          {/* Animated background glow */}
          <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-br from-accent/10 to-accent-secondary/10 blur-xl" />

          {/* Icon container */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-surface to-surface-hover ring-1 ring-border">
            <div className="text-muted">
              {icon}
            </div>
          </div>
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
