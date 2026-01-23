import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, disabled, children, type = 'button', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none active:scale-[0.98]'

    const variants = {
      primary:
        'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 focus-visible:ring-blue-500 dark:shadow-blue-500/20',
      secondary:
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-md hover:from-gray-200 hover:to-gray-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-gray-500 dark:from-gray-700 dark:to-gray-800 dark:text-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700',
      outline:
        'border-2 border-border bg-background/50 backdrop-blur-sm hover:border-muted hover:bg-background hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-muted dark:border-border dark:bg-surface/50 dark:hover:border-muted dark:hover:bg-surface',
      ghost:
        'bg-transparent hover:bg-surface/80 hover:backdrop-blur-sm focus-visible:ring-muted dark:hover:bg-surface/80',
      danger:
        'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 focus-visible:ring-red-500',
    }

    const sizes = {
      sm: 'h-8 px-3.5 text-sm rounded-lg gap-1.5',
      md: 'h-10 px-5 text-sm rounded-xl gap-2',
      lg: 'h-12 px-7 text-base rounded-xl gap-2.5',
    }

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
