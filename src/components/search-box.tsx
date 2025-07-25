import { CENTERED_ROW_CLS } from '@/theme'

import { cn } from '@lib/shadcn-utils'

import { TEXT_SEARCH } from '@/consts'
import { randId } from '@lib/utils'
import type { VariantProps } from 'class-variance-authority'
import { useState } from 'react'
import { CloseIcon } from './icons/close-icon'
import { SearchIcon } from './icons/search-icon'
import {
  Input,
  inputVariants,
  type IInputProps,
} from './shadcn/ui/themed/input'

const BUTTON_CLS = cn(
  CENTERED_ROW_CLS,
  'aspect-square trans-opacity opacity-50 hover:opacity-100 focus-visible:opacity-100',
  'stroke-foreground outline-none',
  'data-[variant=trans]:stroke-white'
)

export interface ISearchBoxProps
  extends IInputProps,
    VariantProps<typeof inputVariants> {
  showClear?: boolean
  searchLabel?: string
  deleteLabel?: string
}

export function SearchBox({
  id,
  variant = 'default',
  //h = 'dialog',
  value,
  placeholder,
  onTextChange,
  onTextChanged,
  showClear = true,
  searchLabel = TEXT_SEARCH,
  deleteLabel: deleteText = 'Clear search',
  className,
  ...props
}: ISearchBoxProps) {
  const [_id] = useState(id ?? randId('searchbox'))

  const [_value, setValue] = useState('')

  const v = value ?? _value

  return (
    <Input
      id={_id}
      value={v}
      variant={variant}
      gap="md"
      type="search"
      aria-label={TEXT_SEARCH}
      data-variant={variant}
      data-mode={variant}
      placeholder={placeholder}
      onTextChange={v => {
        setValue(v)
        onTextChange?.(v)
      }}
      onTextChanged={v => {
        onTextChanged?.(v)
      }}
      leftChildren={
        <button
          onClick={() => onTextChanged?.(v.toString())}
          data-variant={variant}
          data-value={v !== ''}
          className={BUTTON_CLS}
          title={searchLabel}
        >
          <SearchIcon stroke="" />
        </button>
      }
      rightChildren={
        showClear && v ? (
          <button
            data-variant={variant}
            onClick={() => {
              setValue('')
              onTextChange?.('')
              onTextChanged?.('')
            }}
            className={BUTTON_CLS}
            title={deleteText}
          >
            <CloseIcon stroke="" w="w-4 h-4" />
          </button>
        ) : null
      }
      className={className}
      {...props}
    />
  )
}
