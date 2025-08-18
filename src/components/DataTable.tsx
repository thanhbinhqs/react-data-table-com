/*
 * DataTable Component - Column Resizing Test Guide
 * 
 * To test column resizing functionality:
 * 1. Look for the thin vertical line at the right edge of each column header
 * 2. Hover over the right border of any column header - cursor should change to col-resize
 * 3. Click and drag the border left or right to resize the column
 * 4. Release to apply the new size
 * 
 * Features implemented:
 * - Smooth dragging with visual feedback
 * - Minimum and maximum size constraints
 * - Real-time resizing (onChange mode)
 * - Visual resize handle indicators
 * - Touch support for mobile devices
 */

import { useState, useMemo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  Row,
  ColumnResizeMode,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  CaretUp, 
  CaretDown, 
  FunnelSimple, 
  MagnifyingGlass, 
  X,
  Eye,
  EyeSlash,
  ArrowsOutCardinal
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  searchable?: boolean
  filterable?: boolean
  title?: string
  className?: string
  onRowClick?: (row: Row<TData>) => void
  onFilterApply?: (filters: ColumnFiltersState) => void
  onClear?: () => void
}

interface FilterConfig {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  options?: { label: string; value: string }[]
}

export function DataTable<TData>({
  data,
  columns,
  searchable = true,
  filterable = true,
  title,
  className,
  onRowClick,
  onFilterApply,
  onClear,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')

  // Generate filter configs from columns
  const filterConfigs = useMemo(() => {
    return columns
      .filter(col => col.id && col.enableColumnFilter !== false)
      .map(col => ({
        id: col.id as string,
        label: typeof col.header === 'string' ? col.header : col.id as string,
        type: 'text' as const, // Default to text, can be enhanced
      }))
  }, [columns])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    enableColumnResizing: true,
    columnResizeMode,
    columnResizeDirection: 'ltr',
    defaultColumn: {
      minSize: 50,
      maxSize: 800,
      size: 150,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  })

  // Check if any column is currently being resized
  const isResizing = table.getAllColumns().some(col => col.getIsResizing())

  const handleApplyFilters = () => {
    const filters = Object.entries(filterValues)
      .filter(([_, value]) => value && value.toString().trim() !== '')
      .map(([id, value]) => ({ id, value }))
    
    setColumnFilters(filters)
    onFilterApply?.(filters)
  }

  const handleClearFilters = () => {
    setFilterValues({})
    setColumnFilters([])
    setGlobalFilter('')
    onClear?.()
  }

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [filterId]: value,
    }))
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Section - Fixed */}
      <div className="flex items-center justify-between pb-4 flex-shrink-0">
        <div className="space-y-1">
          {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} of {data.length} row(s)
            {isResizing && <span className="ml-2 text-primary">• Resizing columns...</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Global Search */}
          {searchable && (
            <div className="relative w-64">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => setGlobalFilter('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Column Visibility Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Column Visibility</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pt-4">
                {table.getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => (
                    <div key={column.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      />
                      <Label htmlFor={column.id} className="text-sm font-medium">
                        {typeof column.columnDef.header === 'string' 
                          ? column.columnDef.header 
                          : column.id}
                      </Label>
                    </div>
                  ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Filter Sidebar */}
          {filterable && filterConfigs.length > 0 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <FunnelSimple className="h-4 w-4 mr-2" />
                  Filters
                  {columnFilters.length > 0 && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                      {columnFilters.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter Data</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 pt-6">
                  {filterConfigs.map((config) => (
                    <div key={config.id} className="space-y-2">
                      <Label htmlFor={config.id} className="text-sm font-medium">
                        {config.label}
                      </Label>
                      <Input
                        id={config.id}
                        placeholder={`Filter by ${config.label.toLowerCase()}...`}
                        value={filterValues[config.id] || ''}
                        onChange={(e) => handleFilterChange(config.id, e.target.value)}
                      />
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex gap-2">
                    <Button onClick={handleApplyFilters} className="flex-1">
                      Apply Filters
                    </Button>
                    <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                      Clear All
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Table Container - Scrollable */}
      <div className="flex-1 rounded-md border overflow-hidden">
        <div className="h-full overflow-auto">
          <table 
            className="relative w-full"
            style={{
              width: table.getTotalSize(),
            }}
          >
            <thead className="sticky top-0 z-10 bg-background border-b shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="relative h-12 px-4 text-left align-middle font-medium text-muted-foreground group border-r border-border/50 last:border-r-0 select-none"
                      style={{ 
                        width: header.getSize(),
                        maxWidth: header.getSize(),
                        minWidth: header.getSize(),
                      }}
                    >
                      <div className="flex items-center gap-2 h-full">
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              'flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0',
                              header.column.getCanSort() && 'hover:text-foreground'
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="truncate">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {header.column.getCanSort() && (
                              <div className="flex flex-col flex-shrink-0">
                                <CaretUp 
                                  className={cn(
                                    'h-3 w-3 transition-colors',
                                    header.column.getIsSorted() === 'asc' 
                                      ? 'text-foreground' 
                                      : 'text-muted-foreground/50'
                                  )} 
                                />
                                <CaretDown 
                                  className={cn(
                                    'h-3 w-3 -mt-1 transition-colors',
                                    header.column.getIsSorted() === 'desc' 
                                      ? 'text-foreground' 
                                      : 'text-muted-foreground/50'
                                  )} 
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Column Resizer */}
                      {header.column.getCanResize() && (
                        <div
                          className="absolute right-0 top-0 h-full w-3 cursor-col-resize bg-transparent hover:bg-primary/20 active:bg-primary/40 transition-all duration-150"
                          style={{
                            transform: header.column.getIsResizing() ? 'scaleX(1.5)' : undefined,
                            userSelect: 'none',
                            touchAction: 'none',
                          }}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                        >
                          {/* Visual indicator for resize handle */}
                          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-border/60 group-hover:bg-primary/60 transition-colors" />
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      onRowClick && 'cursor-pointer',
                      'data-[state=selected]:bg-muted'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td 
                        key={cell.id} 
                        className="p-4 align-middle border-r border-border/30 last:border-r-0"
                        style={{ 
                          width: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                        }}
                      >
                        <div className="truncate">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}