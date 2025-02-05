import { Button } from '@components/shadcn/ui/themed/button'
import { WorkingIcon } from '@icons/working'
import { type IElementProps } from '@interfaces/element-props'
import { MouseEventHandler } from 'react'

interface IProps extends IElementProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  isLoading?: boolean
}

export function LoadButton({ onClick, isLoading = false, children }: IProps) {
  return (
    <Button onClick={onClick}>
      {children}
      {isLoading && <WorkingIcon className="h-5 w-5" />}
    </Button>
  )
}
