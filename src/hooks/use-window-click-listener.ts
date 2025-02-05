import { useWindowListener } from './use-window-listener'

export function useWindowClickListener(handler: unknown) {
  useWindowListener('click', handler)
}
