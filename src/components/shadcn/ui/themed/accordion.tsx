import { VScrollPanel } from '@components/v-scroll-panel'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import type { IChildrenProps } from '@interfaces/children-props'
import { cn } from '@lib/shadcn-utils'
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
      settings: 'gap-y-2',
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
>(({ variant, className, ...props }, ref) => (
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
>(({ value, onValueChange, variant, className, children }, ref) => {
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
        type="multiple"
        value={v}
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
    className={cn('flex flex-col gap-y-1', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

//  [&>div]:pl-2
export const accordionTriggerVariants = cva(
  cn(
    'outline-2 outline-transparent focus-visible:outline-ring data-[focus=true]:outline-ring -outline-offset-2 rounded-theme',
    'flex flex-row grow items-center truncate justify-between font-semibold hover:underline [&[data-state=open]>svg]:rotate-90'
  ),
  {
    variants: {
      variant: {
        default:
          'hover:bg-muted/50 pl-2.5 pr-2 py-2 data-[state=open]:bg-muted/75',
        settings: 'py-1.5',
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
      variant,
      ...props
    },
    ref
  ) => (
    <AccordionPrimitive.Header className="flex flex-row items-center gap-x-1">
      {leftChildren}

      <AccordionPrimitive.Trigger
        ref={ref}
        className={accordionTriggerVariants({ variant, className })}
        {...props}
      >
        {children}

        {!rightChildren && (
          <ChevronRightIcon className="trans-transform" style={arrowStyle} />
        )}
      </AccordionPrimitive.Trigger>

      {rightChildren && (
        <>
          {rightChildren}

          <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
              'flex flex-row items-center py-2.5 [&[data-state=open]>svg]:rotate-90',
              className
            )}
            {...props}
          >
            <ChevronRightIcon className="trans-transform" style={arrowStyle} />
          </AccordionPrimitive.Trigger>
        </>
      )}
    </AccordionPrimitive.Header>
  )
)
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

export const accordionContentVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'px-1 pb-4 mb-2 gap-y-1',
      settings: 'pl-2 pt-2 pb-4 gap-y-1',
    },
  },
  defaultVariants: {
    variant: 'default',
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
    { variant, className, innerClassName, innerStyle, children, ...props },
    ref
  ) => (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        'overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
      {...props}
    >
      <div
        className={accordionContentVariants({
          variant,
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
