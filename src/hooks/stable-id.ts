import { randID } from '@/lib/id'
import { useRef } from 'react'

/**
 * Generates a stable ID for a component. We assume that the ID will not change during
 * the component's lifecycle.
 *
 * @param id - An optional ID to use.
 * @param prefix - A prefix to use for the generated ID.
 * @returns A stable ID.
 */
export function useStableId(id?: string | null | undefined, prefix = 'id') {
  const generatedIdRef = useRef('')

  if (!generatedIdRef.current) {
    generatedIdRef.current = id ?? randID(prefix)
  }

  return generatedIdRef.current
}
