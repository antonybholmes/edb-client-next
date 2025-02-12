import { useWindowListener } from './use-window-listener'

export function useMouseMoveListener(handler: (event: Event) => void) {
  useWindowListener('mousemove', handler)
}
