import { useWindowListener } from './window-listener'

export function useKeyUpListener(handler: (e: Event) => void) {
  useWindowListener('keyup', handler)
}
