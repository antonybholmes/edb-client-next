import { useWindowListener } from './window-listener'

export function useMouseUpListener(handler: (e: Event) => void) {
  useWindowListener('mouseup', handler)
}
