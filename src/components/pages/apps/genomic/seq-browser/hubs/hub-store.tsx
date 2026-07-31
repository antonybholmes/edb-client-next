import { useEffect } from 'react'

import { create } from 'zustand'
import { IRemoteBigWigTrack, type ISeqTrack } from '../tracks-provider'

import { IDBPDatabase, openDB } from 'idb'

let dbPromise: Promise<IDBPDatabase> | undefined

export function getDB() {
  if (typeof window === 'undefined') {
    return undefined
  }

  if (!dbPromise) {
    dbPromise = openDB('hub-db', 1, {
      upgrade(db) {
        const hubs = db.createObjectStore('hubs', {
          keyPath: 'id',
        })

        hubs.createIndex('name', 'name')
      },
    })
  }

  return dbPromise
}

interface IHub {
  id: string
  name: string
  tracks: (ISeqTrack | IRemoteBigWigTrack)[]
}

interface IHubStore {
  hubs: IHub[]
  loaded: boolean
  load: () => Promise<void>
  addHub: (hub: IHub) => void
  removeHub: (id: string) => void
}

export const useHubStore = create<IHubStore>()((set, get) => ({
  hubs: [],
  loaded: false,
  load: async () => {
    // load data once
    if (get().loaded) {
      return
    }

    const db = await getDB()

    if (!db) {
      return
    }

    const hubs = await db.getAll('hubs')

    set({ hubs, loaded: true })
  },

  addHub: (hub) => {
    set((state) => ({
      hubs: [...state.hubs, hub],
    }))

    dbPromise.then((db) => db.put('hubs', hub)).catch(console.error)
  },

  removeHub: (id) => {
    set((state) => ({
      hubs: state.hubs.filter((h) => h.id !== id),
    }))

    dbPromise.then((db) => db.delete('hubs', id)).catch(console.error)
  },
}))

export function useHubs(): {
  hubs: IHub[]
  addHub: (hub: IHub) => void
  removeHub: (id: string) => void
} {
  const load = useHubStore((s) => s.load)
  const hubs = useHubStore((s) => s.hubs)
  const addHub = useHubStore((s) => s.addHub)
  const removeHub = useHubStore((s) => s.removeHub)

  useEffect(() => {
    load()
  }, [load])

  return {
    hubs,
    addHub,
    removeHub,
  }
}
