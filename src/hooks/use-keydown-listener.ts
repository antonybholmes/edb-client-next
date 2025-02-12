import { useWindowListener } from './use-window-listener'

export function useKeyDownListener(handler: (e: MouseEvent) => void) {
  useWindowListener('keydown', handler)
}
