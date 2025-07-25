import { useWindowListener } from './window-listener'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useClickListener(handler: (e: Event) => void) {
  useWindowListener('click', handler)
}
