import type { ReactNode } from 'react'
import { type IClassProps } from './class-props'

export interface IChildrenProps extends IClassProps {
  children?: ReactNode
}
