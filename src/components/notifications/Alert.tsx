import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { Button } from '../ui/button'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  description?: string
  onClose?: () => void
  closable?: boolean
}

const typeConfig = {
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    Icon: Info,
  },
  success: {
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-200',
    Icon: CheckCircle,
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    Icon: AlertTriangle,
  },
  error: {
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    Icon: AlertCircle,
  },
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      type = 'info',
      title,
      description,
      onClose,
      closable = true,
      children,
      ...props
    },
    ref
  ) => {
    const config = typeConfig[type]
    const Icon = config.Icon

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border px-4 py-3 flex gap-3',
          config.bgColor,
          config.borderColor,
          className
        )}
        {...props}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.textColor)} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('font-semibold', config.textColor)}>
              {title}
            </h4>
          )}
          {description && (
            <p className={cn('text-sm', config.textColor)}>
              {description}
            </p>
          )}
          {children && (
            <div className={cn('text-sm', config.textColor)}>
              {children}
            </div>
          )}
        </div>
        {closable && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn('h-6 w-6 p-0 flex-shrink-0', config.textColor)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }
)
Alert.displayName = 'Alert'

export { Alert }
