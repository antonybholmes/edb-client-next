import { useWindowListener } from './use-window-listener'

export function useMouseUpListener(handler: (e: MouseEvent) => void) {
  useWindowListener('mouseup', handler)
}
