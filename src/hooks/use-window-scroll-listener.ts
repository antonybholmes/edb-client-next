import { useWindowListener } from './use-window-listener'

export function useWindowScrollListener(handler: unknown) {
  useWindowListener('scroll', handler)
}
