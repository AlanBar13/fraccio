import * as React from 'react'
import { Badge } from '../shared'
import { cn } from '@/lib/utils'

export interface RoleBadgeProps {
  role: 'owner' | 'admin' | 'member' | 'viewer'
  variant?: 'badge' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
}

const roleConfig = {
  owner: { label: 'Owner', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  member: { label: 'Member', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
}

const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  variant = 'badge',
  size = 'md',
}) => {
  const config = roleConfig[role]

  if (variant === 'outlined') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border-2 font-semibold transition-colors',
          size === 'sm' && 'px-2 py-0.5 text-xs',
          size === 'md' && 'px-2.5 py-0.5 text-xs',
          size === 'lg' && 'px-3 py-1 text-sm',
          'border-purple-300 dark:border-purple-700',
          config.color
        )}
      >
        {config.label}
      </span>
    )
  }

  return (
    <Badge
      variant={
        role === 'owner'
          ? 'default'
          : role === 'admin'
            ? 'secondary'
            : role === 'member'
              ? 'success'
              : 'outline'
      }
      size={size}
    >
      {config.label}
    </Badge>
  )
}

export { RoleBadge }
