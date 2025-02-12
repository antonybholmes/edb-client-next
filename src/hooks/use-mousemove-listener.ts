import { useWindowListener } from './use-window-listener'

export function useMouseMoveListener(handler: unknown) {
  useWindowListener('mousemove', handler)
}
