import { VScrollPanel } from '@/components/v-scroll-panel'
import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type CSSProperties,
  type ReactNode,
} from 'react'

//const Accordion = AccordionPrimitive.Root

export const accordionVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'gap-y-0.5',
      settings: 'gap-y-1',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const Accordion = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> &
    VariantProps<typeof accordionVariants>
>(({ variant, className = '', ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    id="accordion"
    className={accordionVariants({ variant, className })}
    {...props}
  />
))
Accordion.displayName = 'Accordion'

interface IScrollAccordionProps extends IChildrenProps {
  value: string[]
  onValueChange?: (value: string[]) => void
}

export const ScrollAccordion = forwardRef<
  HTMLDivElement,
  IScrollAccordionProps & VariantProps<typeof accordionVariants>
>(({ value, onValueChange, variant, className = '', children }, ref) => {
  const [_value, setValue] = useState<string[]>([])

  useEffect(() => {
    setValue(value)
  }, [value])

  // if user doesn't supply a change monitor, we'll monitor
  // the accordion internally
  const v = onValueChange ? value : _value

  return (
    <VScrollPanel ref={ref} className={cn('grow', className)}>
      <Accordion
        type="multiple"
        value={v}
        variant={variant}
        // if user species onChange, let them handle which
        // accordions are open, otherwise we'll do it internally
        onValueChange={onValueChange ?? setValue}
        //className={cn(V_SCROLL_CHILD_CLS, 'flex flex-col gap-y-0.5', className)}
      >
        {children}
      </Accordion>
    </VScrollPanel>
  )
})
ScrollAccordion.displayName = 'ScrollAccordion'

export const SubAccordion = forwardRef<HTMLDivElement, IScrollAccordionProps>(
  ({ value, onValueChange, className, children }, ref) => {
    const [_value, setValue] = useState<string[]>(value)

    // useEffect(() => {
    //   setValue(value)
    // }, [value])

    // if user doesn't supply a change monitor, we'll monitor
    // the accordion internally
    const v = onValueChange ? value : _value

    return (
      <Accordion
        value={v}
        type="multiple"
        // if user species onChange, let them handle which
        // accordions are open, otherwise we'll do it internally
        onValueChange={onValueChange ?? setValue}
        className={cn('flex flex-col gap-y-0.5', className)}
        ref={ref}
      >
        {children}
      </Accordion>
    )
  }
)
SubAccordion.displayName = 'SubAccordion'

const AccordionItem = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('flex flex-col gap-y-2', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const TRIGGER_CLS = cn(
  'group relative outline-2 outline-transparent focus-visible:outline-ring data-[focus=true]:outline-ring -outline-offset-2',
  'flex flex-row grow items-center truncate font-semibold [&[data-state=open]>svg]:rotate-90 gap-x-1'
)

//  [&>div]:pl-2
export const accordionTriggerVariants = cva(
  'flex flex-row items-center justify-between gap-x-1',
  {
    variants: {
      variant: {
        default:
          'gap-x-0.5 rounded-md hover:bg-muted/30 text-foreground/70 hover:text-foreground focus-visible:text-foreground data-[state=open]:text-foreground p-1.5',
        settings: 'gap-x-1 py-1.5',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const AccordionTrigger = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> &
    VariantProps<typeof accordionTriggerVariants> & {
      leftChildren?: ReactNode
      rightChildren?: ReactNode
      arrowStyle?: CSSProperties
    }
>(
  (
    {
      className,
      arrowStyle,
      leftChildren,
      rightChildren,
      children,
      variant = 'default',
      ...props
    },
    ref
  ) => (
    <AccordionPrimitive.Header
      className={accordionTriggerVariants({
        variant,
      })}
    >
      {leftChildren}

      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(TRIGGER_CLS, className)}
        {...props}
      >
        <ChevronRightIcon className="trans-transform" style={arrowStyle} />

        {children}
      </AccordionPrimitive.Trigger>

      {rightChildren && rightChildren}
    </AccordionPrimitive.Header>
  )
)
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

export const accordionContentVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'pl-3 pb-4 pr-1',
      settings: 'pl-4.5 gap-y-1',
    },
    gap: {
      medium: 'gap-y-1.5',
      none: '',
      large: 'gap-y-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    gap: 'medium',
  },
})

const AccordionContent = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> &
    VariantProps<typeof accordionContentVariants> & {
      innerClassName?: string
      innerStyle?: CSSProperties
    }
>(
  (
    { variant, gap, className, innerClassName, innerStyle, children, ...props },
    ref
  ) => (
    <AccordionPrimitive.Content ref={ref} className={className} {...props}>
      <div
        className={accordionContentVariants({
          variant,
          gap,
          className: innerClassName,
        })}
        style={innerStyle}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
)
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }

// 'overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
