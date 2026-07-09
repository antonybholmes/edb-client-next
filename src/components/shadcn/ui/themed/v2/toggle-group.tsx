import { useTabIndicators } from '@/components/tabs/tab-indicator-provider'
import { TOOLBAR_COL_CLS } from '@/components/toolbar/toolbar-col'
import { cn } from '@/lib/shadcn-utils'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, useContext, useRef, type ComponentProps } from 'react'
import { Toggle, toggleVariants } from './toggle'

const ToggleGroupContext = createContext<
  { value: string } & VariantProps<typeof toggleVariants>
>({
  value: '',
  size: 'md',
  variant: 'default',
  rounded: 'none',
  justify: 'center',
  pad: 'md',
})

export const toggleGroupVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
      toolbar: TOOLBAR_COL_CLS,
    },
  },
  defaultVariants: {
    direction: 'row',
  },
})

export function ToggleGroup({
  ref,
  className,
  variant,
  size,
  rounded,
  pad,
  aspect,
  justify,
  direction,
  children,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive> &
  VariantProps<typeof toggleVariants> &
  VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive
      ref={ref}
      className={toggleGroupVariants({ direction, className })}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          value: props.value ? props.value.toString() : '',
          variant,
          size,
          rounded,
          justify,
          pad,
          aspect,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

export function GroupToggle({
  variant,
  size,
  rounded,
  pad,
  aspect,
  justify,
  children,
  ...props
}: ComponentProps<typeof Toggle>) {
  const context = useContext(ToggleGroupContext)

  return (
    <Toggle
      variant={context.variant ?? variant}
      size={context.size ?? size}
      rounded={context.rounded ?? rounded}
      pad={context.pad ?? pad}
      aspect={context.aspect ?? aspect}
      justify={context.justify ?? justify}
      {...props}
    >
      {children}
    </Toggle>
  )
}

export function GroupIndicatorToggle({
  isSelected,
  onClick,
  className,
  ...props
}: ComponentProps<typeof GroupToggle> & { isSelected?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)

  const { setSelectedPosition, selectedPosition } = useTabIndicators()

  // useUpdateEffect(() => {
  //   if (isSelected && ref.current) {
  //     const parent = ref.current.parentElement

  //     const containerRect = parent!.getBoundingClientRect()

  //     const clientRect = ref.current.getBoundingClientRect()

  //     setSelectedPosition({
  //       ...selectedPosition,
  //       x: clientRect.left - containerRect.left,
  //       w: clientRect.width,
  //       h: clientRect.height,
  //       y: clientRect.top - containerRect.top,
  //     })
  //   }
  // }, [isSelected, setSelectedPosition, selectedPosition])

  return (
    <GroupToggle
      ref={ref}

      onMouseEnter={(e) => {
        if (!isSelected) {
          return
        }

        setSelectedPosition({
          ...selectedPosition,
          scale: 1.05,
        })
      }}

      onMouseLeave={(e) => {
        if (!isSelected) {
          return
        }

        setSelectedPosition({
          ...selectedPosition,
          scale: 1,
        })
      }}

      onClick={(e) => {
        const parent = e.currentTarget.parentElement

        const containerRect = parent!.getBoundingClientRect()

        const clientRect = e.currentTarget.getBoundingClientRect()

        setSelectedPosition({
          ...selectedPosition,
          x: clientRect.left - containerRect.left,
          w: clientRect.width,
          scale: 1.05,
          //h: clientRect.height,
          //y: clientRect.top - containerRect.top,
        })

        onClick?.(e)
      }}
      className={cn('relative z-50', className)}
      {...props}
    />
  )
}
