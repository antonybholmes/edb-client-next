import { type IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { Field } from '@base-ui/react/field'
import { type ComponentProps } from 'react'

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

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      className={cn(
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70 shrink-0 px-0.5',
        className
      )}
      {...props}
    />
  )
}

interface ILabelContainerProps extends IChildrenProps {
  label: string
  labelPos?: 'left' | 'top'
}

export function LabelContainer({
  label,
  labelPos = 'left',
  className,
  children,
}: ILabelContainerProps) {
  //const [_id] = useState(id ?? randId('input'))

  return (
    <Field.Root>
      <Field.Label
        className={cn(
          'flex items-center',
          labelPos === 'top' ? 'flex-col gap-y-2' : 'flex-row gap-x-2',
          className
        )}
      >
        <span>{label}</span>
        {children}
      </Field.Label>
    </Field.Root>
  )
}
