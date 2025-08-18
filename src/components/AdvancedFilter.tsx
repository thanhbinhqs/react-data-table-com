import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Calendar as CalendarIcon, X, Check, CaretUpDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'

export interface FilterOption {
  value: string
  label: string
}

export interface AdvancedFilterConfig {
  id: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'daterange'
  label: string
  placeholder?: string
  options?: FilterOption[]
  min?: number
  max?: number
}

export interface FilterValue {
  text?: string
  number?: number
  select?: string
  multiselect?: string[]
  date?: Date
  daterange?: DateRange
}

export interface FilterValues {
  [key: string]: FilterValue
}

// Date picker component for single date selection
function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date" 
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left text-xs h-8 font-normal px-2 min-w-0",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-3 w-3 shrink-0" />
          <span className="truncate min-w-0">
            {value ? format(value, "MMM dd, yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setIsOpen(false)
          }}
          initialFocus
          className="p-2"
        />
        <div className="p-2 border-t border-border">
          <Button
            variant="outline"
            className="w-full text-xs h-7"
            onClick={() => {
              onChange(undefined)
              setIsOpen(false)
            }}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Date range picker component
function DateRangePicker({ 
  value, 
  onChange, 
  placeholder = "Select date range" 
}: {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
  placeholder?: string 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return placeholder
    
    if (range.to) {
      const fromYear = range.from.getFullYear()
      const toYear = range.to.getFullYear()
      const fromMonth = range.from.getMonth()
      const toMonth = range.to.getMonth()
      
      // Same year
      if (fromYear === toYear) {
        // Same month - show compact format
        if (fromMonth === toMonth) {
          return `${format(range.from, "MMM dd")} - ${format(range.to, "dd, yyyy")}`
        }
        // Different months, same year
        return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`
      }
      // Different years - use short format
      return `${format(range.from, "dd/MM/yy")} - ${format(range.to, "dd/MM/yy")}`
    }
    
    // Only start date selected
    return `${format(range.from, "MMM dd, yyyy")} →`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left text-xs h-8 font-normal px-2 min-w-0",
            !value?.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-3 w-3 shrink-0" />
          <span className="truncate min-w-0">
            {formatDateRange(value)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={(range) => {
            onChange(range)
            if (range?.from && range?.to) {
              setIsOpen(false)
            }
          }}
          numberOfMonths={2}
          initialFocus
          className="p-2"
        />
        <div className="p-2 border-t border-border">
          <Button
            variant="outline"
            className="w-full text-xs h-7"
            onClick={() => {
              onChange(undefined)
              setIsOpen(false)
            }}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Multi-select component for multiple checkbox selection
function MultiSelect({ 
  options, 
  value = [], 
  onChange, 
  placeholder = "Select options" 
}: {
  options: FilterOption[]
  value?: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedItems = options.filter(option => value.includes(option.value))

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue) 
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const selectAll = () => {
    onChange(options.map(option => option.value))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between text-xs h-8 font-normal"
          >
            {selectedItems.length > 0 
              ? `${selectedItems.length} selected`
              : placeholder
            }
            <CaretUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." className="text-xs h-8" />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                <div className="flex gap-1 p-2 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 flex-1"
                    onClick={selectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 flex-1"
                    onClick={clearAll}
                  >
                    Clear All
                  </Button>
                </div>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={value.includes(option.value)}
                        onChange={() => handleSelect(option.value)}
                      />
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => (
            <Badge
              key={item.value}
              variant="secondary"
              className="text-xs px-1 py-0 h-5"
            >
              {item.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                type="button"
                onClick={() => handleSelect(item.value)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdvancedFilter({ 
  configs,
  values,
  onApply,
  onClear,
  className
}: {
  configs: AdvancedFilterConfig[]
  values: FilterValues
  onApply: (values: FilterValues) => void
  onClear: () => void
  className?: string
}) {
  const [localValues, setLocalValues] = useState<FilterValues>(values)

  // Sync with external value changes
  useEffect(() => {
    setLocalValues(values)
  }, [values])

  const onChange = (configId: string, newValue: FilterValue) => {
    const newValues = { ...localValues, [configId]: newValue }
    setLocalValues(newValues)
  }

  const clearAll = () => {
    setLocalValues({})
    onClear()
  }

  const applyFilters = () => {
    onApply(localValues)
  }

  const hasActiveFilters = Object.keys(localValues).some(key => {
    const value = localValues[key]
    return value && (
      value.text ||
      value.number !== undefined ||
      value.select ||
      (value.multiselect && value.multiselect.length > 0) ||
      value.date ||
      (value.daterange && (value.daterange.from || value.daterange.to))
    )
  })

  return (
    <div className={cn("space-y-4 p-4", className)}>
      <div className="space-y-3">
        {configs.map((config) => {
          const value = localValues[config.id] || {}
          
          return (
            <div key={config.id} className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                {config.label}
              </label>
              
              {config.type === 'text' && (
                <Input
                  value={value.text || ''}
                  onChange={(e) => onChange(config.id, { text: e.target.value })}
                  placeholder={config.placeholder}
                  className="text-xs h-8"
                />
              )}
              
              {config.type === 'number' && (
                <Input
                  value={value.number || ''}
                  onChange={(e) => onChange(config.id, { number: Number(e.target.value) })}
                  placeholder={config.placeholder}
                  type="number"
                  min={config.min}
                  max={config.max}
                  className="text-xs h-8"
                />
              )}
              
              {config.type === 'select' && config.options && (
                <Select
                  value={value.select || ''}
                  onValueChange={(newValue) => onChange(config.id, { select: newValue })}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder={config.placeholder || `Select ${config.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {config.options.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {config.type === 'multiselect' && config.options && (
                <MultiSelect
                  options={config.options}
                  value={value.multiselect || []}
                  onChange={(newValue) => onChange(config.id, { multiselect: newValue })}
                  placeholder={config.placeholder || `Select ${config.label.toLowerCase()}`}
                />
              )}
              
              {config.type === 'date' && (
                <DatePicker
                  value={value.date}
                  onChange={(newValue) => onChange(config.id, { date: newValue })}
                  placeholder={config.placeholder || `Select ${config.label.toLowerCase()}`}
                />
              )}
              
              {config.type === 'daterange' && (
                <DateRangePicker
                  value={value.daterange}
                  onChange={(newValue) => onChange(config.id, { daterange: newValue })}
                  placeholder={config.placeholder || `Select ${config.label.toLowerCase()} range`}
                />
              )}
            </div>
          )
        })}
      </div>
      
      <div className="flex flex-col gap-2 pt-2 border-t">
        {hasActiveFilters && (
          <div className="text-xs text-muted-foreground">
            {Object.keys(localValues).filter(key => {
              const value = localValues[key]
              return value && (
                value.text ||
                value.number !== undefined ||
                value.select ||
                (value.multiselect && value.multiselect.length > 0) ||
                value.date ||
                (value.daterange && (value.daterange.from || value.daterange.to))
              )
            }).length} active filter{Object.keys(localValues).length !== 1 ? 's' : ''}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="text-xs h-7 flex-1"
            disabled={!hasActiveFilters}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
          <Button
            onClick={applyFilters}
            size="sm"
            className="text-xs h-7 flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}