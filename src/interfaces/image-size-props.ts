import { type IImageLoadProps } from './image-load-props'

export interface IImageSizeProps extends IImageLoadProps {
  size?: [number, number]
  sizes?: [number, number][]
}
