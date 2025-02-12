import { useWindowListener } from './use-window-listener'

export function useMouseDownListener(handler: unknown) {
  useWindowListener('mousedown', handler)
}
