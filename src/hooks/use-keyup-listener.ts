import { useWindowListener } from './use-window-listener'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useKeyUpListener(handler: (e: Event) => void) {
  useWindowListener('keyup', handler)
}
