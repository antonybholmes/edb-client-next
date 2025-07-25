import { useWindowListener } from './window-listener'

export function useKeyDownListener(handler: (e: Event) => void) {
  useWindowListener('keydown', handler)
}
