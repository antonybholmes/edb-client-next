import { ComponentProps, ElementType, ReactNode } from 'react'

type GenericComponentProps<T extends ElementType> = {
  as?: T
  children?: ReactNode
} & ComponentProps<T>

export function GenericComponent<T extends ElementType = 'div'>({
  as,
  children,
  ...props
}: GenericComponentProps<T>) {
  const Component = as || 'div'
  return <Component {...props}>{children}</Component>
}
