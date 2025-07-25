import { useWindowListener } from './window-listener'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMouseUpListener(handler: (e: Event) => void) {
  useWindowListener('mouseup', handler)
}
