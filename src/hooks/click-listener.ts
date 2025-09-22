import { useWindowListener } from './window-listener'

export function useClickListener(handler: (e: Event) => void) {
  useWindowListener('click', handler)
}
