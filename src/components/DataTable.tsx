/*
 * DataTable Component - Advanced Features Guide
 * 
 * This component provides a comprehensive data table with the following features:
 * 
 * COLUMN RESIZING:
 * 1. Look for the thin vertical line at the right edge of each column header
 * 2. Hover over the right border of any column header - cursor should change to col-resize
 * 3. Click and drag the border left or right to resize the column
 * 4. Double-click the resize handle to auto-fit column width to content
 * 5. Release to apply the new size
 * 6. All cell content is displayed in single lines with ellipsis for overflow
 * 
 * STICKY COLUMNS:
 * 1. Open the "Columns" panel from the top-right controls
 * 2. Use the pin icons next to each column name:
 *    - Left pin icon: Pin column to the left side
 *    - Center unpin icon: Remove pinning
 *    - Right pin icon: Pin column to the right side
 * 3. Pinned columns will remain visible while scrolling horizontally
 * 4. Use "Unpin All" to quickly remove all column pinning
 * 5. Selection column and row numbers are always pinned to the left when enabled
 * 
 * ROW SELECTION:
 * 1. Enable by setting `selectable={true}` prop
 * 2. Selection column is automatically pinned to the left
 * 3. Click individual checkboxes to select specific rows
 * 4. Click on any cell (except action buttons, row numbers) to toggle row selection
 * 5. Use the header checkbox to select/deselect all visible rows
 * 6. Selection persists through filtering and sorting
 * 7. Clear selection using the "X" button in the selection indicator
 * 8. Access selected data via `onSelectionChange` callback
 * 
 * ROW NUMBERING:
 * 1. Automatic row numbering column is always present
 * 2. Shows sequential numbers starting from 1
 * 3. Numbers adjust automatically when data is filtered
 * 4. Always pinned to the left, positioned after selection column
 * 5. Cannot be hidden, resized, or moved
 * 
 * NEW PROPS:
 * - spin: boolean - Shows a loading spinner overlay when true
 * - sticky: boolean - Controls whether table headers and pinned columns stick during scroll
 * - selectable: boolean - Enables row selection with checkboxes
 * - onSelectionChange: (selectedRows: TData[]) => void - Callback when selection changes
 * 
 * Features implemented:
 * - Smooth column resizing with visual feedback
 * - Double-click auto-sizing to fit content width
 * - Single-line text display with ellipsis for overflow
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
 * - Multi-row selection with checkboxes and cell click toggle
 * - Always left-pinned selection column
 * - Select all functionality
 * - Selection state management and callbacks
 * - Automatic row numbering with filtering awareness
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
  ColumnSizingState,
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
  CircleNotch,
  DotsThree
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

export interface RowAction<TData> {
  label: string
  icon?: React.ComponentType<any>
  onClick: (row: TData) => void
  variant?: 'default' | 'destructive'
  disabled?: (row: TData) => boolean
  hidden?: (row: TData) => boolean
}

export interface RowActionGroup<TData> {
  label?: string
  actions: RowAction<TData>[]
}

export interface BulkAction<TData> {
  label: string
  icon?: React.ComponentType<any>
  onClick: (selectedRows: TData[]) => void
  variant?: 'default' | 'destructive'
  disabled?: (selectedRows: TData[]) => boolean
  confirmMessage?: string
}

export interface ContextMenuItem<TData> {
  label: string
  icon?: React.ComponentType<any>
  onClick: (row: TData) => void
  variant?: 'default' | 'destructive'
  disabled?: (row: TData) => boolean
  hidden?: (row: TData) => boolean
  shortcut?: string
}

export interface ContextMenuGroup<TData> {
  label?: string
  items: ContextMenuItem<TData>[]
}

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
  rowActions?: RowAction<TData>[] | RowActionGroup<TData>[]
  bulkActions?: BulkAction<TData>[]
  contextMenu?: ContextMenuItem<TData>[] | ContextMenuGroup<TData>[]
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
  rowActions,
  bulkActions = [],
  contextMenu,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})

  // Helper function to render context menu content
  const renderContextMenuContent = (row: Row<TData>) => {
    if (!contextMenu || contextMenu.length === 0) return null

    const isGrouped = contextMenu.some((item: any) => 'items' in item)
    
    if (isGrouped) {
      const groups = contextMenu as ContextMenuGroup<TData>[]
      return (
        <>
          {groups.map((group, groupIndex) => {
            const visibleItems = group.items.filter(item => 
              !item.hidden || !item.hidden(row.original)
            )
            
            if (visibleItems.length === 0) return null
            
            return (
              <div key={groupIndex}>
                {group.label && (
                  <ContextMenuLabel className="text-xs text-muted-foreground">
                    {group.label}
                  </ContextMenuLabel>
                )}
                {visibleItems.map((item, itemIndex) => {
                  const Icon = item.icon
                  const isDisabled = item.disabled?.(row.original) || false
                  
                  return (
                    <ContextMenuItem
                      key={itemIndex}
                      onClick={() => !isDisabled && item.onClick(row.original)}
                      disabled={isDisabled}
                      className={cn(
                        "text-xs",
                        item.variant === 'destructive' && "text-destructive focus:text-destructive-foreground focus:bg-destructive"
                      )}
                    >
                      {Icon && <Icon className="h-3 w-3 mr-2" />}
                      {item.label}
                      {item.shortcut && (
                        <ContextMenuShortcut className="text-xs">
                          {item.shortcut}
                        </ContextMenuShortcut>
                      )}
                    </ContextMenuItem>
                  )
                })}
                {groupIndex < groups.length - 1 && visibleItems.length > 0 && (
                  <ContextMenuSeparator />
                )}
              </div>
            )
          })}
        </>
      )
    } else {
      const items = contextMenu as ContextMenuItem<TData>[]
      const visibleItems = items.filter(item => 
        !item.hidden || !item.hidden(row.original)
      )
      
      return (
        <>
          {visibleItems.map((item, index) => {
            const Icon = item.icon
            const isDisabled = item.disabled?.(row.original) || false
            
            return (
              <ContextMenuItem
                key={index}
                onClick={() => !isDisabled && item.onClick(row.original)}
                disabled={isDisabled}
                className={cn(
                  "text-xs",
                  item.variant === 'destructive' && "text-destructive focus:text-destructive-foreground focus:bg-destructive"
                )}
              >
                {Icon && <Icon className="h-3 w-3 mr-2" />}
                {item.label}
                {item.shortcut && (
                  <ContextMenuShortcut className="text-xs">
                    {item.shortcut}
                  </ContextMenuShortcut>
                )}
              </ContextMenuItem>
            )
          })}
        </>
      )
    }
  }

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

  // Create columns with selection and row number columns
  const tableColumns = useMemo(() => {
    const extraColumns: ColumnDef<TData>[] = []

    // Add selection column if selectable
    if (selectable) {
      const selectionColumn: ColumnDef<TData> = {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enablePinning: false, // Disable pinning since it's always pinned left
        size: 44,
        minSize: 44,
        maxSize: 44,
      }
      extraColumns.push(selectionColumn)
    }

    // Add row number column - always present
    const rowNumberColumn: ColumnDef<TData> = {
      id: 'rowNumber',
      header: 'No.',
      cell: ({ row, table }) => {
        // Get the index from filtered rows to maintain correct numbering after filtering
        const filteredRows = table.getFilteredRowModel().rows
        const index = filteredRows.findIndex(r => r.id === row.id)
        return (
          <div className="text-center text-muted-foreground font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis">
            {index + 1}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enableColumnFilter: false,
      enablePinning: false, // Disable pinning since it's always pinned left
      size: 50,
      minSize: 50,
      maxSize: 50,
    }
    extraColumns.push(rowNumberColumn)

    // Add row actions column if rowActions are provided
    if (rowActions && rowActions.length > 0) {
      const rowActionsColumn: ColumnDef<TData> = {
        id: 'rowActions',
        header: '',
        cell: ({ row }) => {
          const isGrouped = rowActions.some((action: any) => 'actions' in action)
          
          if (isGrouped) {
            const groups = rowActions as RowActionGroup<TData>[]
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DotsThree className="h-3 w-3" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {groups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {group.label && (
                        <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                      )}
                      {group.actions.map((action, actionIndex) => {
                        const isHidden = action.hidden?.(row.original) || false
                        const isDisabled = action.disabled?.(row.original) || false
                        
                        if (isHidden) return null
                        
                        const IconComponent = action.icon
                        
                        return (
                          <DropdownMenuItem
                            key={actionIndex}
                            variant={action.variant}
                            disabled={isDisabled}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isDisabled) {
                                action.onClick(row.original)
                              }
                            }}
                            className="cursor-pointer"
                          >
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            {action.label}
                          </DropdownMenuItem>
                        )
                      })}
                      {groupIndex < groups.length - 1 && <DropdownMenuSeparator />}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          } else {
            const actions = rowActions as RowAction<TData>[]
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DotsThree className="h-3 w-3" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {actions.map((action, actionIndex) => {
                    const isHidden = action.hidden?.(row.original) || false
                    const isDisabled = action.disabled?.(row.original) || false
                    
                    if (isHidden) return null
                    
                    const IconComponent = action.icon
                    
                    return (
                      <DropdownMenuItem
                        key={actionIndex}
                        variant={action.variant}
                        disabled={isDisabled}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isDisabled) {
                            action.onClick(row.original)
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        {action.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        },
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enableColumnFilter: false,
        enablePinning: true,
        size: 32,
        minSize: 32,
        maxSize: 32,
      }
      extraColumns.push(rowActionsColumn)
    }

    return [...extraColumns, ...columns]
  }, [columns, selectable, rowActions])

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
    onColumnSizingChange: setColumnSizing,
    enableRowSelection: selectable,
    enableColumnResizing: true,
    enableColumnPinning: true,
    columnResizeMode,
    columnResizeDirection: 'ltr',
    defaultColumn: {
      minSize: 40,
      maxSize: 600,
      size: 120,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnPinning: (() => {
        const leftPinnedColumns = selectable 
          ? ['select', 'rowNumber']
          : ['rowNumber']
        
        const rightPinnedColumns = rowActions && rowActions.length > 0 
          ? ['rowActions']
          : []
        
        return {
          ...columnPinning,
          left: [
            ...leftPinnedColumns, 
            ...(columnPinning.left || []).filter(id => !leftPinnedColumns.includes(id))
          ],
          right: [
            ...rightPinnedColumns,
            ...(columnPinning.right || []).filter(id => !rightPinnedColumns.includes(id))
          ]
        }
      })(),
      rowSelection,
      globalFilter,
      columnSizing,
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
      <div className="flex items-center justify-between pb-2 flex-shrink-0">
        <div className="space-y-0.5">
          {title && <h2 className="text-lg font-bold tracking-tight">{title}</h2>}
          <p className="text-xs text-muted-foreground">
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
            <div className="relative w-56">
              <MagnifyingGlass className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-7 h-7 text-xs"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0.5 top-1/2 h-5 w-5 -translate-y-1/2 p-0"
                  onClick={() => setGlobalFilter('')}
                >
                  <X className="h-2 w-2" />
                </Button>
              )}
            </div>
          )}

          {/* Selection Actions */}
          {selectable && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.toggleAllRowsSelected()}
                className="h-7 text-xs"
              >
                {table.getIsAllRowsSelected() ? 'Deselect All' : 'Select All'}
              </Button>
              {Object.keys(rowSelection).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRowSelection({})}
                  className="h-7 text-xs"
                >
                  Clear Selection
                </Button>
              )}
            </div>
          )}

          {/* Column Visibility and Pinning Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Eye className="h-3 w-3 mr-1" />
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
                          
                          {/* Pin Controls - Hide for selection and rowNumber columns */}
                          {column.getIsVisible() && column.getCanPin() && column.id !== 'select' && column.id !== 'rowNumber' && (
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
                          
                          {/* Selection and row number column indicators */}
                          {column.id === 'select' && (
                            <div className="text-xs text-muted-foreground">
                              Always pinned left
                            </div>
                          )}
                          {column.id === 'rowNumber' && (
                            <div className="text-xs text-muted-foreground">
                              Row numbers - pinned left
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
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <FunnelSimple className="h-3 w-3 mr-1" />
                  Filters
                  {columnFilters.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
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

      {/* Bulk Actions Toolbar */}
      {selectable && bulkActions.length > 0 && selectedRowsData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border border-primary/20 rounded-md mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">
              {selectedRowsData.length} row{selectedRowsData.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, index) => {
              const Icon = action.icon
              const isDisabled = action.disabled?.(selectedRowsData) || false
              
              const handleClick = () => {
                if (action.confirmMessage) {
                  if (confirm(action.confirmMessage.replace('{count}', selectedRowsData.length.toString()))) {
                    action.onClick(selectedRowsData)
                  }
                } else {
                  action.onClick(selectedRowsData)
                }
              }
              
              return (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={handleClick}
                  disabled={isDisabled}
                  className="h-7 text-xs"
                >
                  {Icon && <Icon className="h-3 w-3 mr-1" />}
                  {action.label}
                </Button>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Table Container - Scrollable */}
      <div className="flex-1 rounded-md border overflow-hidden relative">
        <div className="h-full overflow-auto" style={{ isolation: 'isolate' }}>
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
              isolation: 'isolate',
            }}
          >
            <thead className={cn(
              "z-[60] bg-background border-b shadow-sm",
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
                          "relative h-6 px-2 text-left align-middle font-medium text-muted-foreground group border-r border-border/50 last:border-r-0 select-none text-xs",
                          isPinned && sticky && "sticky z-[70] bg-background/100 shadow-sm border-l border-border/30",
                          isPinned === 'left' && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]",
                          isPinned === 'right' && "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]",
                          header.column.id === 'select' && "text-center",
                          header.column.id === 'rowNumber' && "text-center"
                        )}
                        style={{ 
                          width: header.getSize(),
                          maxWidth: header.getSize(),
                          minWidth: header.getSize(),
                          left: isPinned === 'left' && sticky ? pinnedPosition : undefined,
                          right: isPinned === 'right' && sticky ? pinnedPosition : undefined,
                        }}
                      >
                        <div className={cn(
                          "flex items-center gap-2 h-full",
                          header.column.id === 'select' && "justify-center",
                          header.column.id === 'rowNumber' && "justify-center"
                        )}>
                          {header.isPlaceholder ? null : (
                            <div
                              className={cn(
                                'flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0',
                                header.column.getCanSort() && 'hover:text-foreground',
                                header.column.id === 'select' && 'justify-center',
                                header.column.id === 'rowNumber' && 'justify-center'
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
                                      'h-2 w-2 transition-colors',
                                      header.column.getIsSorted() === 'asc' 
                                        ? 'text-foreground' 
                                        : 'text-muted-foreground/50'
                                    )} 
                                  />
                                  <CaretDown 
                                    className={cn(
                                      'h-2 w-2 -mt-0.5 transition-colors',
                                      header.column.getIsSorted() === 'desc' 
                                        ? 'text-foreground' 
                                        : 'text-muted-foreground/50'
                                    )} 
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Pin indicator - Hide for selection and row number columns */}
                          {isPinned && header.column.id !== 'select' && header.column.id !== 'rowNumber' && (
                            <PushPin className={cn(
                              "h-2 w-2 text-primary flex-shrink-0",
                              isPinned === 'right' && "rotate-90"
                            )} />
                          )}
                        </div>
                        
                        {/* Column Resizer */}
                        {header.column.getCanResize() && (
                          <div
                            className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-primary/20 active:bg-primary/40 transition-all duration-150"
                            style={{
                              transform: header.column.getIsResizing() ? 'scaleX(1.5)' : undefined,
                              userSelect: 'none',
                              touchAction: 'none',
                            }}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onDoubleClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              
                              // Auto-fit column width to content
                              const column = header.column
                              const columnId = column.id
                              
                              // Calculate the maximum content width for this column
                              let maxWidth = 40 // minimum width
                              
                              // Check header text width
                              const headerText = typeof column.columnDef.header === 'string' 
                                ? column.columnDef.header 
                                : columnId
                              maxWidth = Math.max(maxWidth, headerText.length * 6 + 40) // approximate char width + padding
                              
                              // Check all visible row content widths
                              const rows = table.getFilteredRowModel().rows
                              rows.forEach(row => {
                                const cell = row.getVisibleCells().find(c => c.column.id === columnId)
                                if (cell) {
                                  let cellText = ''
                                  
                                  // Get text content from cell
                                  const cellValue = cell.getValue()
                                  if (typeof cellValue === 'string') {
                                    cellText = cellValue
                                  } else if (typeof cellValue === 'number') {
                                    cellText = cellValue.toString()
                                  } else if (cellValue && typeof cellValue === 'object') {
                                    cellText = JSON.stringify(cellValue)
                                  }
                                  
                                  // Handle special cells like badges or formatted dates
                                  if (columnId === 'status') {
                                    cellText = cellValue as string || ''
                                  } else if (columnId === 'joinDate') {
                                    cellText = new Date(cellValue as string).toLocaleDateString()
                                  } else if (columnId === 'rowNumber') {
                                    cellText = '999' // assume max 3 digits for numbering
                                  }
                                  
                                  const contentWidth = cellText.length * 6 + 20 // approximate char width + padding
                                  maxWidth = Math.max(maxWidth, contentWidth)
                                }
                              })
                              
                              // Apply size constraints from column definition
                              const minSize = column.columnDef.minSize || 40
                              const maxSize = column.columnDef.maxSize || 600
                              const finalWidth = Math.min(Math.max(maxWidth, minSize), maxSize)
                              
                              // Update column sizing using the table's setter
                              setColumnSizing(prev => ({
                                ...prev,
                                [columnId]: finalWidth
                              }))
                            }}
                            title="Drag to resize • Double-click to auto-fit"
                          >
                            {/* Visual indicator for resize handle */}
                            <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2 w-0.5 h-4 bg-border/60 group-hover:bg-primary/60 transition-colors" />
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
                table.getRowModel().rows.map((row) => {
                  const RowComponent = (
                    <tr
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        'group border-b transition-colors',
                        // Base hover state for the entire row
                        'hover:bg-muted/30',
                        onRowClick && 'cursor-pointer',
                        'data-[state=selected]:bg-muted'
                      )}
                      onClick={(e) => {
                        // Don't trigger row click if clicking on checkbox or action buttons
                        if (e.target instanceof HTMLElement && 
                            (e.target.closest('[role="checkbox"]') || 
                             e.target.closest('button') || 
                             e.target.closest('a'))) {
                          return
                        }
                        
                        // If selectable, toggle selection on cell click
                        if (selectable) {
                          row.toggleSelected()
                        }
                        
                        // Also call the onRowClick handler if provided
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
                              "px-2 py-0.5 align-middle border-r border-border/30 last:border-r-0",
                              // Base hover styles for non-pinned columns
                              !isPinned && "group-hover:bg-muted/50",
                              // Pinned column styles with higher z-index and solid background
                              isPinned && sticky && "sticky z-50 bg-background/100 border-l border-border/20",
                              // Pinned column hover styles - use solid background to prevent blur
                              isPinned && sticky && "group-hover:bg-muted/100",
                              isPinned === 'left' && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]",
                              isPinned === 'right' && "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]",
                              selectable && cell.column.id !== 'select' && cell.column.id !== 'rowNumber' && "cursor-pointer"
                            )}
                            style={{ 
                              width: cell.column.getSize(),
                              maxWidth: cell.column.getSize(),
                              minWidth: cell.column.getSize(),
                              left: isPinned === 'left' && sticky ? pinnedPosition : undefined,
                              right: isPinned === 'right' && sticky ? pinnedPosition : undefined,
                            }}
                            onClick={(e) => {
                              // Handle cell click for selection toggle (except for select, rowNumber columns and action buttons)
                              if (selectable && 
                                  cell.column.id !== 'select' && 
                                  cell.column.id !== 'rowNumber' &&
                                  !(e.target as HTMLElement)?.closest('button') && 
                                  !(e.target as HTMLElement)?.closest('a') &&
                                  !(e.target as HTMLElement)?.closest('[role="checkbox"]')) {
                                e.stopPropagation()
                                row.toggleSelected()
                              }
                            }}
                          >
                            <div className="truncate text-xs leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )

                  // Wrap with context menu if contextMenu prop is provided
                  if (contextMenu && contextMenu.length > 0) {
                    return (
                      <ContextMenu key={row.id}>
                        <ContextMenuTrigger asChild>
                          {RowComponent}
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          {renderContextMenuContent(row)}
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  }

                  return RowComponent
                })
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