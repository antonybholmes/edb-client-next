import { useWindowListener } from './use-window-listener'

export function useKeyDownListener(handler: (e: Event) => void) {
  useWindowListener('keydown', handler)
}
