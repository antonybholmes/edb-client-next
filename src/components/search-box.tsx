import { CENTERED_ROW_CLS } from '@/theme'
import type { IInputProps } from '@interfaces/input-props'
import { cn } from '@lib/class-names'

import type { VariantProps } from 'class-variance-authority'
import { useState, type ChangeEvent } from 'react'
import { CloseIcon } from './icons/close-icon'
import { SearchIcon } from './icons/search-icon'
import { Input, inputVariants } from './shadcn/ui/themed/input'

const BUTTON_CLS = cn(
  CENTERED_ROW_CLS,
  'aspect-square trans-opacity opacity-50 hover:opacity-100',
  'data-[variant=default]:stroke-foreground data-[variant=header]:stroke-foreground',
  'data-[variant=trans]:stroke-white'
)

interface IProps extends IInputProps, VariantProps<typeof inputVariants> {
  onSearch?: (event: 'search' | 'clear', value: string) => void
}

export function SearchBox({
  variant = 'default',
  h = 'lg',
  value,
  placeholder,
  onChange,
  onSearch,
  className,
  ...props
}: IProps) {
  const [_value, setValue] = useState('')

  function _onChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.currentTarget.value)
    onChange?.(e)
  }

  const v: string | number | readonly string[] =
    value !== undefined ? value : _value

  return (
    <Input
      value={v}
      variant={variant}
      h={h}
      aria-label="Search"
      data-mode={variant}
      placeholder={placeholder}
      onChange={_onChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSearch?.('search', v.toString())
        }
      }}
      leftChildren={
        <button
          onClick={() => onSearch?.('search', v.toString())}
          data-variant={variant}
          data-value={v !== ''}
          className={BUTTON_CLS}
          title="Search"
        >
          <SearchIcon />
        </button>
      }
      rightChildren={
        v ? (
          <button
            data-variant={variant}
            onClick={() => {
              setValue('')
              onSearch?.('clear', '')
            }}
            className={BUTTON_CLS}
            title="Delete contents from search box"
          >
            <CloseIcon />
          </button>
        ) : undefined
      }
      className={cn('px-2.5', className)}
      {...props}
    />
  )
}
