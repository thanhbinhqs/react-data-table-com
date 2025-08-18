import { useState, useEffect } from 'react'
import { Calendar } from '@/compo
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/check
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, X, Check, CaretUpDown } from '@phosphor-icons/react'
  id: string
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
  placeholder?: string


  label: string
  multiselect?:
}

export interface AdvancedFilterConfig {
  values: Re
  label: string
  className?: string
  options?: FilterOption[]
  value, 
  min?: number
  max?: number
}

export interface FilterValue {
    if (!range.
  select?: string
  return (
      <Popove
          variant="outline"
            "w-fu
 

        </Button>
      <PopoverContent className="
          initialFocus
          defaultMonth={value?.from}
          onSelect={(
            if (range
            }
 

            variant="outlin
         
  onChange, 
          >
     
      </PopoverContent>
  )

  va
  placeholder = "Select date" 

  placeholder?: string 
  const [isOpen, setIsOpen] = useState(f
  return (
      <PopoverTrigger asChild>
   

  return (
          <Calendar className="mr-2 h-3 w-3" />
        </Button>
      <PopoverC
          variant="outline"
          onSelect={(dat
            setIsOpen(false)
          initialFocus
        <div
         
            onClick={() => {
              setIsOpen(false)
        </Button>
          </Button>
      </PopoverContent>
  )
          initialFocus
  options, 
          defaultMonth={value?.from}
}: {
  value?: string[]
  placeholder?: string
  const [isOpen, setIsOpen] = useState(fals
  const selectedItems = option
            }
      ? valu
    onChange(newValue)

    onChange(value.filter(v => v !== o

    <div className="space-y-2
        <PopoverTrigger asChild>
            variant="outline
            aria-expanded={isOpen
          >
              
          >
            <Chev
        </PopoverTr
          <Com
      </PopoverContent>
              
  )
 

                    <d
         
            
  placeholder = "Select date" 
     
              
                ))}
  placeholder?: string 
    
              <Button

  return (
                Select All
      <PopoverTrigger asChild>
               
                onClick={()
                Clear Al
            </div>
        </PopoverContent>

      {se
          <Calendar className="mr-2 h-3 w-3" />
              key={item.value}
        </Button>
              {item.lab
                type="button"
                o
          mode="single"
            </Badge>
        </div>
    </div>
            setIsOpen(false)
export funct
          initialFocus
  onApply,
  className
  const [localVal
  // Sync with external value
    setLocalValues(values)
            onClick={() => {
    const newValues = { ...localV
              setIsOpen(false)

          >
    onClear()
          </Button>
    const valu
      </PopoverContent>
      (value.t
  )
 


  options, 
        {confi
  onChange, 
            <div key={config.id} cla
}: {
                <Input
  value?: string[]
                  className="text-xs h-8
  placeholder?: string
    
                  type="number"

                  max={config.max}

                  className="text-xs h-8"
              )}
              {config.type === 'select' && c
                  value={value.
    onChange(newValue)
   

                  <SelectContent>
                    {config.options.map((option) =
   

          

                <MultiSelect
        <PopoverTrigger asChild>
                 
              )}
              {config.type 
                  value={value.dat
                  placeholder={config.placeholder || `Sele
          >
              {config.type === 'daterange' 
                  value={value.daterange}
                 
              )}
          )
      </div>
      <div classNam
          {hasActiveFilte
              const value = localValues[key]
            }).leng
        </div>
        <div className="f
            variant="outline"
            onClick={clearAl
            className="text-xs h-7"
            <X className="h-3 
          </Button>
            size="sm"
            className="text-xs h-7"
            Apply Filters
        </div>
    </div>
}










                ))}





              <Button





                Select All

              <Button







            </div>

        </PopoverContent>





          {selectedItems.map((item) => (

              key={item.value}





                type="button"





            </Badge>

        </div>

    </div>

}



  values,

  onApply,

  className





    setLocalValues(values)





    onChange(newValues)





    onClear()





    





















                <Input





              )}



                  type="number"



                  max={config.max}



                  className="text-xs h-8"

              )}











                  <SelectContent>











                <MultiSelect





              )}











                  value={value.daterange}



              )}

          )

      </div>





              const value = localValues[key]



        </div>



            variant="outline"



            className="text-xs h-7"



          </Button>

            size="sm"

            className="text-xs h-7"

            Apply Filters

        </div>

    </div>

}