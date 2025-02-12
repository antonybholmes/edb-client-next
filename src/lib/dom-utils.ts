// https://github.com/ifeanyiisitor/react-use-scroll-direction/blob/main/src/domUtils.ts

export function getScrollTop(target?: HTMLElement) {
  if (target) return target.scrollTop
  return (
    window.scrollY ||
    document.body.scrollTop ||
    (document.documentElement && document.documentElement.scrollTop) ||
    0
  )
}

export function getScrollLeft(target?: HTMLElement) {
  if (target) return target.scrollLeft
  return (
    window.scrollX ||
    document.body.scrollLeft ||
    (document.documentElement && document.documentElement.scrollLeft) ||
    0
  )
}

export function isBrowser() {
  return typeof window === 'object'
}

export function addScrollListener(
  target: HTMLElement | Document = document,
  listener: (event: Event) => void
) {
  return target.addEventListener('scroll', listener)
}

export function removeScrollListener(
  target: HTMLElement | Document = document,
  listener: (event: Event) => void
) {
  return target.removeEventListener('scroll', listener)
}
