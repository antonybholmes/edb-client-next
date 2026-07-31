import { useEffect } from 'react'

import { create } from 'zustand'
import { IRemoteBigWigTrack, type ISeqTrack } from '../tracks-provider'

import { IDBEntity } from '@/interfaces/db-entity'
import { randomHexColor } from '@/lib/color/color'
import { makeUuid } from '@/lib/id'
import { IDBPDatabase, openDB } from 'idb'

let dbPromise: Promise<IDBPDatabase> | undefined

export interface IHub extends IDBEntity {
  version: number
  color: string
  tracks: (ISeqTrack | IRemoteBigWigTrack)[]
}

const DEFAULT_HUB: IHub = {
  id: '019fba14-8def-724d-b836-1e912bd6de63',
  version: 2,
  name: 'Default',
  color: '#c0c0c0',
  tracks: [],
}

interface IHubProps {
  name?: string
  color?: string
}

export function makeNewHub(
  { name = 'Default', color = randomHexColor() } = {} as IHubProps
): IHub {
  return {
    version: 2,
    id: makeUuid(),
    name,
    color,
    tracks: [],
  }
}

function getDB() {
  if (typeof window === 'undefined') {
    return undefined
  }

  if (!dbPromise) {
    dbPromise = openDB('hub-db', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('hubs')) {
          const hubs = db.createObjectStore('hubs', {
            keyPath: 'id',
          })

          hubs.createIndex('name', 'name')

          hubs.add({ ...DEFAULT_HUB })
        }
      },
    })
  }

  return dbPromise
}

interface IHubStore {
  hubs: IHub[]
  loaded: boolean
  load: () => Promise<void>
  addHub: (hub: IHub) => void
  removeHub: (id: string) => void
  updateHub: (hub: IHub) => void
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

  updateHub: (hub: IHub) => {
    set((state) => ({
      hubs: state.hubs.map((h) => (h.id === hub.id ? hub : h)),
    }))

    dbPromise.then((db) => db.put('hubs', hub)).catch(console.error)
  },
}))

export function useHubs(): {
  hubs: IHub[]
  addHub: (hub: IHub) => void
  removeHub: (id: string) => void
  updateHub: (hub: IHub) => void
} {
  const load = useHubStore((s) => s.load)
  const hubs = useHubStore((s) => s.hubs)
  const addHub = useHubStore((s) => s.addHub)
  const removeHub = useHubStore((s) => s.removeHub)
  const updateHub = useHubStore((s) => s.updateHub)

  useEffect(() => {
    load()
  }, [load])

  return {
    hubs,
    addHub,
    removeHub,
    updateHub,
  }
}
