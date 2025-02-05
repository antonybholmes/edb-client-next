import { type IElementProps } from './element-props'

export interface ILayoutProps extends IElementProps {
  description?: string
  showTitle?: boolean
  subTitle?: string
  superTitle?: string
  tab?: string
  isIndexed?: boolean
}
