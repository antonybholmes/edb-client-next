import { useWindowListener } from './use-window-listener'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWindowScrollListener(handler: any) {
  useWindowListener('scroll', handler)
}
