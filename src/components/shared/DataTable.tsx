import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'

export interface DataTableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  width?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  sortKey?: keyof T
  sortDirection?: 'asc' | 'desc'
  className?: string
  hoverable?: boolean
  striped?: boolean
  dense?: boolean
}

export const DataTable = React.forwardRef<
  HTMLTableElement,
  DataTableProps<any>
>(
  (
    {
      columns,
      data,
      onSort,
      sortKey,
      sortDirection,
      className,
      hoverable = true,
      striped = false,
      dense = false,
    },
    ref
  ) => {
    const handleSort = (key: any) => {
      if (!onSort) return
      const newDirection =
        sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
      onSort(key, newDirection)
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table
          ref={ref}
          className={cn(
            'w-full text-sm border-collapse',
            className
          )}
        >
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left font-semibold text-foreground/80',
                    dense && 'py-2 px-3 text-xs',
                    col.className
                  )}
                  style={{ width: col.width }}
                >
                  {col.sortable && onSort ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="flex items-center gap-2">
                        {col.label}
                        {sortKey === col.key && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        )}
                      </span>
                    </Button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={cn(
                    'px-4 py-8 text-center text-foreground/50',
                    dense && 'py-4 px-3'
                  )}
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    'border-b border-border/30 transition-colors',
                    striped && idx % 2 === 0 && 'bg-muted/20',
                    hoverable && 'hover:bg-muted/40'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        'px-4 py-3 text-foreground',
                        dense && 'py-2 px-3 text-xs',
                        col.className
                      )}
                      style={{ width: col.width }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }
)

DataTable.displayName = 'DataTable'
