import { useClickListener } from '@/hooks/click-listener'
import { useKeyDownListener } from '@/hooks/keydown-listener'
import { useStableId } from '@/hooks/stable-id'
import { cn } from '@/lib/shadcn-utils'
import {
  Children,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { BaseCol } from './layout/base-col'
import { VCenterRow } from './layout/v-center-row'
import { SearchBox, type ISearchBoxProps } from './search-box'
import { ToolbarSeparator } from './toolbar/toolbar-separator'

type IProps = ISearchBoxProps & {
  asList?: boolean
  isOpen?: boolean
  autoOpen?: boolean
  footer?: ReactNode
}

export function Autocomplete({
  id,
  isOpen,
  autoOpen = true,
  asList = true,
  rightChildren,
  className,
  children,
  value,
  footer,
  ...props
}: IProps) {
  const _id = id || useStableId('autocomplete')

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

  const hasRightChildren = !!rightChildren

  return (
    <BaseCol
      id={id}
      data-open={_isOpen}
      data-has-right-children={hasRightChildren}
      className={cn('relative', className)}
      ref={ref}

      // onBlur={() => {
      //   console.log('blur')
      //   setFocus(false)
      // }}
    >
      <VCenterRow
        data-open={_isOpen}
        data-has-right-children={hasRightChildren}
        className={`z-20 data-[open=true]:z-40 ml-3 mr-3 data-[has-right-children=true]:mr-2 h-10 border-b gap-x-1
          data-[open=true]:border-border/50 
          data-[open=false]:border-transparent`}
        onFocus={() => {
          setHasFocus(true)
        }}
        // onBlur={() => {
        //   setFocus(false)
        // }}
      >
        <label htmlFor={_id} className="sr-only">
          Search
        </label>
        <SearchBox
          id={_id}
          value={value}
          //onTextChange={handleSearch}
          //onTextChanged={handleSearch}
          //onSearch={handleSearch}
          variant="plain"
          className="grow"
          {...props}
        />

        {rightChildren && (
          <VCenterRow className="gap-x-1">
            <ToolbarSeparator />
            {rightChildren}
          </VCenterRow>
        )}
      </VCenterRow>

      {/* z order is adjusted so that when open, it will be on top of other autocomplete elements
      otherwise they can intefer with each other when the z indices are equal */}
      <BaseCol
        id="autocomplete-container"
        data-open={_isOpen}
        //data-focus={focus}
        className={`absolute  
          rounded-theme border border-border/50 data-[open=true]:shadow-lg bg-background
          w-full min-h-10 data-[open=true]:pt-11 data-[open=true]:pb-3 
          z-10 data-[open=true]:z-30 top-0 
          overflow-hidden`}
      >
        <BaseCol
          id="autocomplete-list"
          data-open={_isOpen}
          className={cn(
            'grow overflow-y-auto max-h-42 custom-scrollbar hidden data-[open=true]:flex mx-0.5'
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
        {footer && (
          <VCenterRow
            data-open={_isOpen}
            className="px-2 pt-2 justify-end hidden data-[open=true]:flex"
          >
            {footer}
          </VCenterRow>
        )}
      </BaseCol>
    </BaseCol>
  )
}

const AUTOCOMPLETE_LI_CLS = cn(
  'flex flex-row items-center hover:bg-muted/50 min-h-9 rounded-sm',
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
