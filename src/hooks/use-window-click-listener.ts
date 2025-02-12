import { useWindowListener } from './use-window-listener'

export function useWindowClickListener(handler: (e: Event) => void) {
  useWindowListener('click', handler)
}
