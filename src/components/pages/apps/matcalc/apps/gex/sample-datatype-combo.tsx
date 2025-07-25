import { CheckIcon } from '@icons/check-icon'
import { ChevronUpDownIcon } from '@icons/chevron-up-down-icon'
import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'
import { Button } from '@themed/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@themed/command'
import { Popover, PopoverContent, PopoverTrigger } from '@themed/popover'
import { useState } from 'react'

interface IProp extends IDivProps {
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
      <PopoverTrigger asChild>
        <Button
          variant="input"
          role="combobox"
          ripple={false}
          aria-expanded={open}
          checked={open}
          justify="start"
          className={cn('gap-x-4', className)}
        >
          <span className="truncate grow text-left">
            {selectedValues.length > 0
              ? selectedValues.join(', ')
              : 'Select sample info...'}
          </span>
          <ChevronUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search sample info..." />
          <CommandList>
            <CommandEmpty>No sample info found.</CommandEmpty>
            <CommandGroup>
              {values.map(v => (
                <CommandItem
                  key={v}
                  value={v}
                  onSelect={currentValue => {
                    console.log(currentValue)
                    setValue?.(
                      currentValue,
                      !selectedValues.includes(currentValue)
                    )
                    setOpen(false)
                  }}
                >
                  <></>
                  {v}
                  <CheckIcon
                    stroke=""
                    className={cn([
                      selectedValues.includes(v),
                      'opacity-100',
                      'opacity-0',
                    ])}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
