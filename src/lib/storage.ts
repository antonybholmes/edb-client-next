import { useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { useMemo } from 'react'
import { nanoid } from './utils'

export function makeKey(group: string, slot: string): string {
  return `edb:${group}:${slot}:${nanoid()}`
}

// Function to check the total space used by localStorage
function getLocalStorageSize(): number {
  let totalSize = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key)
      if (key && value) {
        totalSize += key.length + value.length
      }
    }
  }
  return totalSize
}

// Function to store data with random keys, while limiting storage size
export function storeItem(
  group: string,
  slot: string,
  data: string,
  maxStorageSize: number = 5000000
): string {
  // 5MB default limit
  const randomKey = makeKey(group, slot)
  const currentStorageSize = getLocalStorageSize()

  // If storage exceeds the limit, remove the oldest item (or evict based on some strategy)
  if (currentStorageSize + data.length > maxStorageSize) {
    console.log('Storage limit reached, evicting the oldest item...')
    // Here we just remove the first item in the storage, but you could use a more sophisticated eviction strategy
    localStorage.removeItem(localStorage.key(0)!)
  }

  // Store the new item
  localStorage.setItem(randomKey, data)
  console.log(`Stored item with key: ${randomKey}`)

  return randomKey
}

// export function storageAtom<T>(key: string, initialValue: T) {
//   function getInitialValue(): T {
//     const item = localStorage.getItem(key)
//     if (item !== null) {
//       return JSON.parse(item)
//     }
//     return initialValue
//   }

//   console.log('atomWithLocalStorage', key, getInitialValue())

//   const baseAtom = atom(getInitialValue())
//   const derivedAtom = atom(
//     get => get(baseAtom),
//     (get, set, update) => {
//       const nextValue =
//         typeof update === 'function' ? update(get(baseAtom)) : update
//       set(baseAtom, nextValue)
//       localStorage.setItem(key, JSON.stringify(nextValue))
//     }
//   )
//   return derivedAtom
// }

export function useStorageAtom<T>(id: string, initialValue: T) {
  // const widthAtom = useMemo(() => {
  //   return storageAtom(key, initialValue)
  // }, [key])

  // return useAtom(widthAtom)

  const atom = useMemo(() => atomWithStorage<T>(id, initialValue), [id])
  return useAtom(atom)
}

export function useSessionAtom<T>(id: string, initialValue: T) {
  // const widthAtom = useMemo(() => {
  //   return storageAtom(key, initialValue)
  // }, [key])

  // return useAtom(widthAtom)

  const atom = useMemo(
    () =>
      atomWithStorage<T>(
        id,
        initialValue,
        createJSONStorage(() => sessionStorage)
      ),
    [id]
  )
  return useAtom(atom)
}
