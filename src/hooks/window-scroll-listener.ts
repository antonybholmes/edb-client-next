import { useWindowListener } from './window-listener'

export function useWindowScrollListener(handler: (e: Event) => void) {
  useWindowListener('scroll', handler)
}
