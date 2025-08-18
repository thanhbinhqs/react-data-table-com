/*
 * DataTable Component - Advanced Features Guide
 * 
 * This component provides a comprehensive data table with the following features:
 * 
 * COLUMN RESIZING:
 * 1. Look for the thin vertical line at the right edge of each column header
 * 2. Hover over the right border of any column header - cursor should change to col-resize
 * 3. Click and drag the border left or right to resize the column
 * 4. Release to apply the new size
 * 
 * STICKY COLUMNS:
 * 1. Open the "Columns" panel from the top-right controls
 * 2. Use the pin icons next to each column name:
 *    - Left pin icon: Pin column to the left side
 *    - Center unpin icon: Remove pinning
 *    - Right pin icon: Pin column to the right side
 * 3. Pinned columns will remain visible while scrolling horizontally
 * 4. Use "Unpin All" to quickly remove all column pinning
 * 
 * ROW SELECTION:
 * 1. Enable by setting `selectable={true}` prop
 * 2. Click individual checkboxes to select specific rows
 * 3. Use the header checkbox to select/deselect all visible rows
 * 4. Selection persists through filtering and sorting
 * 5. Clear selection using the "X" button in the selection indicator
 * 6. Access selected data via `onSelectionChange` callback
 * 
 * NEW PROPS:
 * - spin: boolean - Shows a loading spinner overlay when true
 * - sticky: boolean - Controls whether table headers and pinned columns stick during scroll
 * - selectable: boolean - Enables row selection with checkboxes
 * - onSelectionChange: (selectedRows: TData[]) => void - Callback when selection changes
 * 
 * Features implemented:
 * - Smooth column resizing with visual feedback
 * - Minimum and maximum size constraints
 * - Real-time resizing (onChange mode)
 * - Visual resize handle indicators
 * - Touch support for mobile devices
 * - Left and right column pinning with sticky positioning
 * - Visual indicators for pinned columns
 * - Shadow effects to show column boundaries
 * - Maintain pinning state during table operations
 * - Loading state with spinner overlay
 * - Configurable sticky header behavior
 * - Multi-row selection with checkboxes
 * - Select all functionality
 * - Selection state management and callbacks
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
  ColumnPinningState,
  RowSelectionState,
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
  ArrowsOutCardinal,
  PushPin,
  PushPinSlash,
  CircleNotch
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
  spin?: boolean
  sticky?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: TData[]) => void
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
  spin = false,
  sticky = true,
  selectable = false,
  onSelectionChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
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

  // Create columns with selection column if selectable
  const tableColumns = useMemo(() => {
    if (!selectable) return columns

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enablePinning: true,
      size: 50,
      minSize: 50,
      maxSize: 50,
    }

    return [selectionColumn, ...columns]
  }, [columns, selectable])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row, index) => {
      // Use id field if available, otherwise use index
      return (row as any).id?.toString() || index.toString()
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: selectable,
    enableColumnResizing: true,
    enableColumnPinning: true,
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
      columnPinning,
      rowSelection,
      globalFilter,
    },
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  })

  // Get selected rows data
  const selectedRowsData = useMemo(() => {
    return table.getFilteredSelectedRowModel().rows.map(row => row.original)
  }, [rowSelection, table])

  // Notify parent component of selection changes
  useMemo(() => {
    onSelectionChange?.(selectedRowsData)
  }, [selectedRowsData, onSelectionChange])

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
            {selectable && Object.keys(rowSelection).length > 0 && (
              <span className="ml-2 text-primary">
                • {Object.keys(rowSelection).filter(key => rowSelection[key]).length} selected
              </span>
            )}
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

          {/* Selection Actions */}
          {selectable && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.toggleAllRowsSelected()}
              >
                {table.getIsAllRowsSelected() ? 'Deselect All' : 'Select All'}
              </Button>
              {Object.keys(rowSelection).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRowSelection({})}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          )}

          {/* Column Visibility and Pinning Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Column Settings</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 pt-4">
                {/* Selection Controls */}
                {selectable && Object.keys(rowSelection).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Selection</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setRowSelection({})}
                        className="flex-1"
                      >
                        Clear Selection ({Object.keys(rowSelection).filter(key => rowSelection[key]).length})
                      </Button>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Column Visibility</h4>
                  <div className="space-y-3">
                    {table.getAllColumns()
                      .filter(column => column.getCanHide())
                      .map(column => (
                        <div key={column.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
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
                          
                          {/* Pin Controls */}
                          {column.getIsVisible() && column.getCanPin() && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => column.pin('left')}
                                title="Pin to left"
                                disabled={column.getIsPinned() === 'left'}
                              >
                                <PushPin className={cn(
                                  "h-3 w-3 transition-colors",
                                  column.getIsPinned() === 'left' ? "text-primary" : "text-muted-foreground"
                                )} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => column.pin(false)}
                                title="Unpin"
                                disabled={!column.getIsPinned()}
                              >
                                <PushPinSlash className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => column.pin('right')}
                                title="Pin to right"
                                disabled={column.getIsPinned() === 'right'}
                              >
                                <PushPin className={cn(
                                  "h-3 w-3 transition-colors rotate-90",
                                  column.getIsPinned() === 'right' ? "text-primary" : "text-muted-foreground"
                                )} />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Quick Actions</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => table.resetColumnPinning()}
                      className="flex-1"
                    >
                      Unpin All
                    </Button>
                  </div>
                </div>
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
      <div className="flex-1 rounded-md border overflow-hidden relative">
        <div className="h-full overflow-auto">
          {spin && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex items-center gap-3 text-muted-foreground">
                <CircleNotch className="h-6 w-6 animate-spin" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
            </div>
          )}
          <table 
            className="relative w-full"
            style={{
              width: table.getTotalSize(),
            }}
          >
            <thead className={cn(
              "z-20 bg-background border-b shadow-sm",
              sticky && "sticky top-0"
            )}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isPinned = header.column.getIsPinned()
                    const pinnedPosition = isPinned === 'left' 
                      ? `${header.column.getStart('left')}px`
                      : isPinned === 'right'
                      ? `${header.column.getAfter('right')}px`
                      : undefined

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "relative h-12 px-4 text-left align-middle font-medium text-muted-foreground group border-r border-border/50 last:border-r-0 select-none",
                          isPinned && sticky && "sticky z-30 bg-background shadow-sm",
                          isPinned === 'left' && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]",
                          isPinned === 'right' && "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                        )}
                        style={{ 
                          width: header.getSize(),
                          maxWidth: header.getSize(),
                          minWidth: header.getSize(),
                          left: isPinned === 'left' && sticky ? pinnedPosition : undefined,
                          right: isPinned === 'right' && sticky ? pinnedPosition : undefined,
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
                          
                          {/* Pin indicator */}
                          {isPinned && (
                            <PushPin className={cn(
                              "h-3 w-3 text-primary flex-shrink-0",
                              isPinned === 'right' && "rotate-90"
                            )} />
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
                    )
                  })}
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
                      'group border-b transition-colors hover:bg-muted/50',
                      onRowClick && 'cursor-pointer',
                      'data-[state=selected]:bg-muted'
                    )}
                    onClick={(e) => {
                      // Don't trigger row click if clicking on checkbox
                      if (e.target instanceof HTMLElement && 
                          e.target.closest('[role="checkbox"]')) {
                        return
                      }
                      onRowClick?.(row)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isPinned = cell.column.getIsPinned()
                      const pinnedPosition = isPinned === 'left' 
                        ? `${cell.column.getStart('left')}px`
                        : isPinned === 'right'
                        ? `${cell.column.getAfter('right')}px`
                        : undefined

                      return (
                        <td 
                          key={cell.id} 
                          className={cn(
                            "p-4 align-middle border-r border-border/30 last:border-r-0 group-hover:bg-muted/50",
                            isPinned && sticky && "sticky z-10 bg-background group-hover:bg-muted/50",
                            isPinned === 'left' && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]",
                            isPinned === 'right' && "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.05)]"
                          )}
                          style={{ 
                            width: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                            minWidth: cell.column.getSize(),
                            left: isPinned === 'left' && sticky ? pinnedPosition : undefined,
                            right: isPinned === 'right' && sticky ? pinnedPosition : undefined,
                          }}
                        >
                          <div className="truncate">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tableColumns.length} className="h-24 text-center text-muted-foreground">
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