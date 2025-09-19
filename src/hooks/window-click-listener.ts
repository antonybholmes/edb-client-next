import { useWindowListener } from './window-listener'

export function useWindowClickListener(handler: (e: Event) => void) {
  useWindowListener('click', handler)
}
