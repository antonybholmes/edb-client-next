import { useClickListener } from '@/hooks/click-listener'
import { useKeyDownListener } from '@/hooks/keydown-listener'
import { cn } from '@lib/shadcn-utils'
import { Children, useRef, useState, type ComponentProps } from 'react'
import { BaseCol } from './layout/base-col'
import { VCenterRow } from './layout/v-center-row'
import { SearchBox, type ISearchBoxProps } from './search-box'

export function Autocomplete({
  id,

  isOpen,
  autoOpen = true,
  asList = true,
  className,
  children,
  ...props
}: ISearchBoxProps & {
  asList?: boolean
  isOpen?: boolean
  autoOpen?: boolean
}) {
  const c = Children.toArray(children)

  //const [isOpen, setIsOpen] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   setIsOpen(focus && c.length > 0)
  // }, [c])

  useKeyDownListener((event: Event) => {
    const e = event as KeyboardEvent

    if (e.key === 'Escape') {
      setHasFocus(false)
    }
  })

  // if we click outside search, close it
  useClickListener((event: Event) => {
    const e = event as MouseEvent

    if (ref.current && !ref.current.contains(e.target as Node)) {
      setHasFocus(false)
    }
  })

  const _isOpen =
    isOpen !== undefined ? isOpen : autoOpen && hasFocus && c.length > 0

  return (
    <BaseCol
      id={id}
      data-open={_isOpen}
      className={cn('relative group', className)}
      ref={ref}

      // onBlur={() => {
      //   console.log('blur')
      //   setFocus(false)
      // }}
    >
      <VCenterRow
        data-open={_isOpen}
        className={`z-20 data-[open=true]:z-40 mx-3 h-9 border-b 
          data-[open=true]:border-border/50 
          data-[open=false]:border-transparent`}
        onFocus={() => {
          setHasFocus(true)
        }}
        // onBlur={() => {
        //   setFocus(false)
        // }}
      >
        <SearchBox
          //value={value}
          //onTextChange={handleSearch}
          //onTextChanged={handleSearch}
          //onSearch={handleSearch}
          variant="plain"
          h="dialog"
          className="grow"
          {...props}
        />
      </VCenterRow>

      {/* z order is adjusted so that when open, it will be on top of other autocomplete elements
      otherwise they can intefer with each other when the z indices are equal */}
      <BaseCol
        id="autocomplete-container"
        data-open={_isOpen}
        //data-focus={focus}
        className={`absolute  
          rounded-theme border border-border/50 data-[open=true]:shadow-lg bg-background
          w-full min-h-9 data-[open=true]:pt-11 data-[open=true]:pb-3 
          z-10 data-[open=true]:z-30 top-0 
          overflow-hidden`}
      >
        <BaseCol
          id="autocomplete-list"
          data-open={_isOpen}
          className={cn(
            'grow overflow-y-auto max-h-42 custom-scrollbar hidden data-[open=true]:flex'
          )}
        >
          {asList ? (
            <ul data-open={_isOpen} className="flex flex-col">
              {c}
            </ul>
          ) : (
            c
          )}
        </BaseCol>
      </BaseCol>
    </BaseCol>
  )
}

const AUTOCOMPLETE_LI_CLS = cn(
  'flex flex-row items-center hover:bg-muted/50 min-h-9',
  'focus-visible:bg-muted/50 data-[focus=true]:bg-muted/50',
  'outline-none flex flex-row items-center px-4 gap-x-2 overflow-hidden'
)

export function AutocompleteLi({
  className,
  children,
  ...props
}: ComponentProps<'li'>) {
  const [focus, setFocus] = useState(false)

  return (
    <li
      data-focus={focus}
      className={cn(AUTOCOMPLETE_LI_CLS, className)}
      onFocus={() => {
        setFocus(true)
      }}
      onBlur={() => setFocus(false)}
      {...props}
    >
      {children}
    </li>
  )
}
