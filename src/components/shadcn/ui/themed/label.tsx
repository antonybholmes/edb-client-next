import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@lib/shadcn-utils'
import * as LabelPrimitive from '@radix-ui/react-label'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

// const labelVariants = cva(
//   'peer-disabled:cursor-not-allowed peer-disabled:opacity-70 shrink-0',
//   {
//     variants: {
//       variant: {
//         default: 'font-semibold',
//       },
//     },
//     defaultVariants: {
//       variant: 'default',
//     },
//   }
// )

export const Label = forwardRef<
  ComponentRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70 shrink-0 px-0.5',
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

interface ILabelContainerProps extends IChildrenProps {
  id: string
  label: string
  labelPos?: 'left' | 'top'
  labelW?: string
}

export function LabelContainer({
  id,
  label,
  labelPos = 'left',
  labelW = 'min-w-24',
  className,
  children,
}: ILabelContainerProps) {
  //const [_id] = useState(id ?? randId('input'))

  if (labelPos === 'top') {
    return (
      <BaseCol className={cn('gap-y-1', className)}>
        <Label
          className="text-sm font-bold text-foreground/80 px-0.5"
          htmlFor={id}
        >
          {label}
        </Label>

        {children}
      </BaseCol>
    )
  } else {
    return (
      <VCenterRow className="gap-x-4 grow">
        <Label className={labelW} htmlFor={id}>
          {label}
        </Label>

        {children}
      </VCenterRow>
    )
  }
}
