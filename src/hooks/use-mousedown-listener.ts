import { useWindowListener } from './use-window-listener'

export function useMouseDownListener(handler: (event: Event) => void) {
  useWindowListener('mousedown', handler)
}
