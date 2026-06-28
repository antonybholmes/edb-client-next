import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  triggerVariants,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ChevronUpDownIcon } from '@/icons/chevron-up-down-icon'
import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import {
  CheckedCommandItem,
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/themed/command'
import type { VariantProps } from 'class-variance-authority'
import { useState } from 'react'

const CLS = `flex flex-row items-center gap-x-4 justify-between border border-border/50 
  hover:border-ring data-popup-open:border-ring trans-color h-9 pl-2 pr-1 rounded-theme`

interface IProp extends IDivProps, VariantProps<typeof triggerVariants> {
  selectedValues: string[]
  setValue?: (value: string, selected: boolean) => void
  values: string[]
}

export function SampleDataTypeCombo({
  selectedValues,
  setValue,
  values,
  className,
}: IProp) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(CLS, className)} w="lg">
        <span className="truncate grow text-left">
          {selectedValues.length > 0
            ? selectedValues.join(', ')
            : 'Select sample info...'}
        </span>
        <ChevronUpDownIcon className="opacity-50" />
      </PopoverTrigger>

      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search sample info..." />
          <CommandList>
            <CommandEmpty>No sample info found.</CommandEmpty>

            {values.map((v) => (
              <CheckedCommandItem
                key={v}
                value={v}
                checked={selectedValues.includes(v)}
                onSelect={(currentValue) => {
                  setValue?.(
                    currentValue,
                    !selectedValues.includes(currentValue)
                  )
                  setOpen(false)
                }}
              >
                {v}
              </CheckedCommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
