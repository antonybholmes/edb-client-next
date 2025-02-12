import { cn } from '@lib/class-names'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { type VariantProps } from 'class-variance-authority'
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'
import { toggleVariants } from './toggle'

const ToggleGroupContext = createContext<
  { value: string } & VariantProps<typeof toggleVariants>
>({
  value: '',
  size: 'default',
  variant: 'default',
  rounded: 'none',
  justify: 'center',
})

const ToggleGroup = forwardRef<
  ComponentRef<typeof ToggleGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, rounded, justify, children, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Root ref={ref} className={className} {...props}>
      <ToggleGroupContext.Provider
        value={{
          value: props.value ? props.value.toString() : '',
          variant,
          size,
          rounded,
          justify,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
})

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = forwardRef<
  ComponentRef<typeof ToggleGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(
  (
    { value, variant, size, rounded, justify, className, children, ...props },
    ref
  ) => {
    const context = useContext(ToggleGroupContext)

    const vt = context.variant ?? variant

    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        value={value}
        className={cn(
          toggleVariants({
            variant: vt,
            size: context.size ?? size,
            rounded: context.rounded ?? rounded,
            justify: context.justify ?? justify,
          }),
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    )
  }
)

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
