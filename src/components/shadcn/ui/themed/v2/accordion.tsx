import { VScrollPanel } from '@/components/v-scroll-panel'
import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import {
  Accordion as AccordionPrimitive,
  type AccordionValue,
} from '@base-ui/react/accordion'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronRight } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react'

//const Accordion = AccordionPrimitive.Root

export const accordionVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'gap-y-0.5',
      settings: 'gap-y-8 pr-4',
      sidebar: 'mt-1 gap-y-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function Accordion({
  ref,
  variant,
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Root> &
  VariantProps<typeof accordionVariants>) {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      id="accordion"
      className={accordionVariants({ variant, className })}
      {...props}
    />
  )
}

interface IScrollAccordionProps extends IChildrenProps {
  value: string[]
  onValueChange?: (value: string[]) => void
}

export function ScrollAccordion({
  ref,
  value,
  multiple = true,
  onValueChange,
  variant,
  className,
  children,
  innerCls,
}: ComponentProps<typeof Accordion> &
  VariantProps<typeof accordionVariants> & { innerCls?: string }) {
  const [_value, setValue] = useState<AccordionValue | undefined>(value)

  useEffect(() => {
    setValue(value)
  }, [value])

  // if user doesn't supply a change monitor, we'll monitor
  // the accordion internally
  const v = onValueChange ? value : _value

  return (
    <VScrollPanel ref={ref} className={cn('grow', className)}>
      <Accordion
        multiple={multiple}
        value={v}
        variant={variant}
        // if user species onChange, let them handle which
        // accordions are open, otherwise we'll do it internally
        onValueChange={onValueChange ?? setValue}
        className={innerCls}
      >
        {children}
      </Accordion>
    </VScrollPanel>
  )
}

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
        multiple={true}
        value={v}
        // if user species onChange, let them handle which
        // accordions are open, otherwise we'll do it internally
        onValueChange={v =>
          onValueChange?.(v as string[]) ?? setValue(v as string[])
        }
        className={cn('flex flex-col gap-y-0.5', className)}
        ref={ref}
      >
        {children}
      </Accordion>
    )
  }
)
SubAccordion.displayName = 'SubAccordion'

const accordionItemVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'gap-y-1',
      settings: 'gap-y-2',
      sidebar: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function AccordionItem({
  ref,
  variant,
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item> &
  VariantProps<typeof accordionItemVariants>) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={accordionItemVariants({
        variant,
        className,
      })}
      {...props}
    />
  )
}

const TRIGGER_CLS = cn(
  'group relative outline-2 outline-transparent focus-visible:outline-ring data-[focus=true]:outline-ring -outline-offset-2',
  'flex flex-row grow items-center font-semibold'
)

//  [&>div]:pl-2
export const accordionTriggerVariants = cva(
  'group flex flex-row items-center gap-x-1',
  {
    variants: {
      variant: {
        default: '',
        settings:
          'text-base py-1 data-[show-border=true]:pt-4 data-[show-border=true]:border-t data-[show-border=true]:border-border/50',
        sidebar: 'px-0.5 text-sm h-7 rounded-theme hover:bg-muted/30 text-xs',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export function AccordionTrigger({
  ref,
  className,
  arrowStyle,
  isFirst = false,
  side = 'left',
  leftChildren,
  rightChildren,
  children,
  variant = 'default',

  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger> &
  VariantProps<typeof accordionTriggerVariants> & {
    leftChildren?: ReactNode
    rightChildren?: ReactNode
    side?: 'left' | 'right'
    isFirst?: boolean
    'data-show-border'?: boolean
    arrowStyle?: CSSProperties
  }) {
  const showBorder = props['data-show-border']

  return (
    <AccordionPrimitive.Header
      className={cn('grow w-full flex flex-row items-center', {
        'justify-between': side === 'right',
      })}
    >
      {leftChildren && leftChildren}

      <AccordionPrimitive.Trigger
        ref={ref}
        data-show-border={showBorder}
        data-is-first={isFirst}
        className={accordionTriggerVariants({
          className: cn(
            TRIGGER_CLS,

            className
          ),
          variant,
        })}
        {...props}
      >
        {side === 'right' && children}
        <ChevronRight
          className="trans-transform group-data-panel-open:rotate-90"
          style={arrowStyle}
          size={16}
        />

        {side === 'left' && children}
      </AccordionPrimitive.Trigger>

      {rightChildren && rightChildren}
    </AccordionPrimitive.Header>
  )
}

export const accordionContentVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'py-1 gap-y-1',
      settings: 'gap-y-2',
      sidebar: 'gap-y-1 py-1 pl-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function AccordionContent({
  ref,
  variant,
  className = '',
  innerCls,
  innerStyle,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Panel> &
  VariantProps<typeof accordionContentVariants> & {
    innerCls?: string
    innerStyle?: CSSProperties
  }) {
  return (
    <AccordionPrimitive.Panel ref={ref} className={className} {...props}>
      <div
        className={accordionContentVariants({
          variant,
          className: innerCls,
        })}
        style={innerStyle}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

// 'overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
