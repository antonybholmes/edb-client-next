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

export const ACCORDION_PANEL_CLS =
  'h-(--accordion-panel-height) overflow-hidden transition-[height] duration-300 ease-[ease-in-out] data-ending-style:h-0 data-starting-style:h-0'

export const accordionVariants = cva('flex flex-col w-full', {
  variants: {
    variant: {
      default: 'gap-y-0.5',
      settings: 'gap-y-8',
      sidebar: 'mt-1 gap-y-px',
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
    if ((value?.length ?? 0) > 0) {
      setValue(value)
    }
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
        onValueChange={(v) =>
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
    variant: 'sidebar',
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
  'group relative outline-2 outline-transparent',
  'focus-visible:outline-ring data-[focus=true]:outline-ring -outline-offset-2',
  'flex flex-row grow items-center font-semibold'
)

//  [&>div]:pl-2
export const accordionHeaderVariants = cva(
  'group flex flex-row items-center gap-x-1.5',
  {
    variants: {
      variant: {
        default: '',
        settings:
          'text-base data-[show-border=true]:pt-4 data-[show-border=true]:border-t data-[show-border=true]:border-border/50',
        sidebar:
          'h-7 rounded-theme overflow-hidden hover:bg-muted/50 text-xs trans-color pr-1.5',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'sidebar',
    },
  }
)

export const accordionTriggerVariants = cva(
  'flex flex-row items-center grow gap-x-1 truncate h-full',
  {
    variants: {
      variant: {
        default: '',
        settings: '',
        sidebar: 'px-1.5',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'sidebar',
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
  variant,

  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger> &
  VariantProps<typeof accordionHeaderVariants> & {
    leftChildren?: ReactNode
    rightChildren?: ReactNode
    side?: 'left' | 'right'
    isFirst?: boolean
    'data-show-border'?: boolean
    arrowStyle?: CSSProperties
  }) {
  const showBorder = props['data-show-border']
  const [hover, setHover] = useState(false)

  return (
    <AccordionPrimitive.Header
      data-show-border={showBorder}
      data-is-first={isFirst}
      data-hover={hover}
      className={accordionHeaderVariants({
        className: cn(TRIGGER_CLS, className),
        variant,
      })}
    >
      {leftChildren && leftChildren}

      <AccordionPrimitive.Trigger
        ref={ref}
        className={accordionTriggerVariants({ variant })}
        data-hover={hover}

        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
        {...props}
      >
        {side === 'right' && children}
        <ChevronRight
          className="trans-transform group-data-open:rotate-90"
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
      settings: 'gap-y-2 pb-2',
      sidebar: 'gap-y-1 p-1 pl-2.5 px-1.5',
    },
  },
  defaultVariants: {
    variant: 'sidebar',
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
    <AccordionPrimitive.Panel
      ref={ref}
      className={cn(ACCORDION_PANEL_CLS, className)}
      {...props}
    >
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
