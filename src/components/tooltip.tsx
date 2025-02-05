import type { TooltipContentProps } from '@radix-ui/react-tooltip'
import {
  TooltipContent,
  Tooltip as TooltipPrimitive,
  TooltipProvider,
  TooltipTrigger,
} from './shadcn/ui/themed/tooltip'

interface IProps extends TooltipContentProps {}

export function Tooltip({ content, side = 'bottom', children }: IProps) {
  return (
    <TooltipProvider>
      <TooltipPrimitive>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>
          <p>{content}</p>
        </TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  )
}
