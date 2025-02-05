import { useWindowListener } from './use-window-listener'

  
export function useKeyUpListener(handler: (e: MouseEvent) => void) {
  useWindowListener('keyup', handler)
}
