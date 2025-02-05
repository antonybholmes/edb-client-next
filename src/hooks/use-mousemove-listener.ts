import { useWindowListener } from './use-window-listener'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMouseMoveListener(handler: any) {
  useWindowListener('mousemove', handler)
}
