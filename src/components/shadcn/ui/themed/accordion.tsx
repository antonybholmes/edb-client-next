import { ChevronRightIcon } from '@components/icons/chevron-right-icon'
import { V_SCROLL_CHILD_CLS, VScrollPanel } from '@components/v-scroll-panel'
import type { IChildrenProps } from '@interfaces/children-props'
import { cn } from '@lib/class-names'
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

const Accordion = AccordionPrimitive.Root

interface IScrollAccordionProps extends IChildrenProps {
  value: string[]
  onValueChange?: (value: string[]) => void
}

export const ScrollAccordion = forwardRef<
  HTMLDivElement,
  IScrollAccordionProps
>(({ value, onValueChange, className, children }, ref) => {
  const [_value, setValue] = useState<string[]>([])

  useEffect(() => {
    setValue(value)
  }, [value])

  // if user doesn't supply a change monitor, we'll monitor
  // the accordion internally
  const v = onValueChange ? value : _value

  return (
    <VScrollPanel asChild={true} ref={ref} className="grow">
      <Accordion
        type="multiple"
        value={v}
        // if user species onChange, let them handle which
        // accordions are open, otherwise we'll do it internally
        onValueChange={onValueChange ?? setValue}
        className={cn(V_SCROLL_CHILD_CLS, 'flex flex-col gap-y-0.5', className)}
      >
        {children}
      </Accordion>
    </VScrollPanel>
  )
})

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

const AccordionItem = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={className} {...props} />
))
AccordionItem.displayName = 'AccordionItem'

export const accordionTriggerVariants = cva(
  'flex flex-1 items-center truncate justify-between p-1.5 font-semibold hover:underline [&[data-state=open]>svg]:rotate-90',
  {
    variants: {
      variant: {
        default: 'rounded-theme hover:bg-muted',
        basic: '',
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
        {/* <ChevronDownIcon className="h-4 w-4 shrink-0 text-foreground/50 transition-transform duration-200" /> */}
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

const AccordionContent = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
    innerClassName?: string
    innerStyle?: CSSProperties
  }
>(
  (
    { className, innerClassName = 'gap-y-1', innerStyle, children, ...props },
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
        className={cn('flex flex-col p-2', innerClassName)}
        style={innerStyle}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
)
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
