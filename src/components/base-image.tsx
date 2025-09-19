import Image from 'next/image'
import { ComponentProps } from 'react'

export function getSizes(size: [number, number]): [number, number][] {
  return [
    [size[0] / 4, size[1] / 4],
    [size[0] / 2, size[1] / 2],
    [size[0], size[1]],
  ] // size[0] / 8,
}

export function getSizeStr(size: [number, number]): string {
  return `(min-width: ${size[0]}px) ${size[0]}px, 100vw`
}

export function getSrcSet(
  name: string,
  dir: string,
  ext: string = 'avif',
  sizes: [number, number][]
): string {
  return sizes
    .map((s) => `${dir}/opt/${name}-${s[0]}x${s[1]}.${ext} ${s[0]}w`)
    .join(', ')
}

export function getSrc(
  name: string,
  dir: string,
  ext: string = 'avif',
  size: [number, number]
): string {
  return `${dir}/opt/${name}-${size[0]}x${size[1]}.${ext}`
}

export function getPlaceholderSrc(
  name: string,
  dir: string,
  ext: string = 'avif'
): string {
  return `${dir}/opt/${name}-placeholder.${ext}`
}

export function BaseImage({
  alt = 'Interesting Image',
  ...props
}: ComponentProps<typeof Image>) {
  return <Image alt={alt} {...props} />
}
