'use client'

import { clamp } from '@/lib/math/clamp'
import { ILimit } from '@/lib/math/limit'
import { numSort } from '@/lib/math/math'
import { round } from '@/lib/math/round'

import { useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export const DEFAULT_ZOOM_LEVELS = [0.1, 0.25, 0.5, 0.75, 1, 2, 3, 4, 5]

interface IZoomContext {
  zoom: number
  levels: number[]
  setZoom: (zoom: number) => void
  setZoomLevels: (levels: number[]) => void
  increaseZoom: () => void
  decreaseZoom: () => void
  resetZoom: () => void
}

interface IZoomChannel {
  id: string
  zoom: number
  levels: number[]
}

const STORAGE_KEY = 'zoom-channels:v14'

export const DEFAULT_ZOOM_CHANNEL_NAME = 'default'

export const DEFAULT_ZOOM_CHANNEL: IZoomChannel = {
  id: DEFAULT_ZOOM_CHANNEL_NAME,
  zoom: 1,

  levels: DEFAULT_ZOOM_LEVELS,
}

export interface IZoomStore {
  zooms: Record<string, IZoomChannel>
  //initializeZoom: (id: string, defaults?: IZoomChannel) => void
  setZoom: (id: string, value: number) => { zoom: number }

  setZoomLevels: (id: string, levels: number[]) => void
  resetZoom: (id: string) => void
  increaseZoom: (id: string) => { zoom: number }
  decreaseZoom: (id: string) => { zoom: number }
  resetAll: () => void
}

export const DEFAULT_ZOOM = 1

export const useZoomStore = create<IZoomStore>()(
  persist(
    (set, get) => ({
      zooms: { [DEFAULT_ZOOM_CHANNEL_NAME]: { ...DEFAULT_ZOOM_CHANNEL } },

      setZoom: (id, value) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

        //const index = zc.levels.findIndex((level) => level === zoom)

        //if (index === zc.index) {
        //  return { zoom: zc.levels[zc.index], index: zc.index }
        //}

        const zoom = clamp(value, {
          min: zc.levels[0],
          max: zc.levels.at(-1),
        })

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: {
                ...zc,
                zoom,
              },
            },
          }
        })

        return { zoom }
      },

      setZoomLevels: (id, levels) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

        levels = numSort(levels)

        const index = clamp(zc.zoom, { min: levels[0], max: levels.at(-1) })

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: {
                ...zc,
                index,
                levels,
              },
            },
          }
        })
      },
      increaseZoom: (id) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

        const zoom = clamp(round(zc.zoom + 0.1, 1), {
          min: zc.levels[0],
          max: zc.levels.at(-1),
        })

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: { ...zc, zoom },
            },
          }
        })

        return { zoom }
      },
      decreaseZoom: (id) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }
        const zoom = clamp(round(zc.zoom - 0.1, 1), {
          min: zc.levels[0],
          max: zc.levels.at(-1),
        })

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: { ...zc, zoom },
            },
          }
        })

        return { zoom }
      },
      resetZoom: (channel) => {
        set((state) => {
          const zooms = { ...state.zooms }
          delete zooms[channel]

          return { zooms }
        })
      },
      resetAll: () =>
        set({
          zooms: {},
        }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
)

interface IZoomOpts {
  channel?: string
  defaultZoom?: IZoomChannel
  onChange?: ({ zoom }: { zoom: number }) => void
}

/**
 * A hook for accessing a zoom channel from a zoom store.
 * This is to allow for multiple independent zoom levels for different parts of the application.
 *
 * @param channel The zoom channel to access.
 * @returns An object containing the current zoom value and a function to set the zoom value for the specified channel.
 */
export function useZoom(
  opts: IZoomOpts = {}
): IZoomContext & { zoom: number; limit: ILimit } {
  const {
    channel = DEFAULT_ZOOM_CHANNEL_NAME,
    defaultZoom = DEFAULT_ZOOM_CHANNEL,
    onChange,
  } = opts

  //const { settings } = useEdbSettings()

  const z = useZoomStore(
    useShallow(
      (state) => state.zooms[channel] ?? { ...defaultZoom, id: channel }
    )
  )

  const setZoom = useZoomStore((state) => state.setZoom)

  const setZoomLevels = useZoomStore((state) => state.setZoomLevels)
  const resetZoom = useZoomStore((state) => state.resetZoom)
  const increaseZoom = useZoomStore((state) => state.increaseZoom)
  const decreaseZoom = useZoomStore((state) => state.decreaseZoom)

  // useEffect(() => {
  //   initializeZoom(channel, { ...defaultZoom, id: channel })
  // }, [channel, defaultZoom, initializeZoom])

  const setChannelZoom = useCallback(
    (value: number) => {
      setZoom(channel, value)
    },
    [channel, setZoom]
  )

  const setChannelZoomLevels = useCallback(
    (levels: number[]) => {
      setZoomLevels(channel, levels)
    },
    [channel, setZoomLevels]
  )

  const incrementChannelZoom = useCallback(() => {
    increaseZoom(channel)
  }, [channel, increaseZoom])

  const decrementChannelZoom = useCallback(() => {
    decreaseZoom(channel)
  }, [channel, decreaseZoom])

  const resetChannelZoom = useCallback(
    () => resetZoom(channel),
    [channel, resetZoom]
  )

  useEffect(() => {
    return useZoomStore.subscribe((state, previousState) => {
      const nextZoom = state.zooms[channel]?.zoom
      const previousZoom = previousState.zooms[channel]?.zoom

      if (nextZoom !== previousZoom && nextZoom !== undefined) {
        onChange?.({ zoom: nextZoom })
      }
    })
  }, [channel, onChange])

  return {
    zoom: z.zoom,
    levels: z.levels,
    limit: {
      min: z.levels[0],
      max: z.levels[z.levels.length - 1],
    },
    increaseZoom: incrementChannelZoom,
    decreaseZoom: decrementChannelZoom,
    setZoom: setChannelZoom,
    setZoomLevels: setChannelZoomLevels,
    resetZoom: resetChannelZoom,
  }
}

// const ZoomContext = createContext<IZoomContext>({
//   zoom: DEFAULT_ZOOM,
//   index: 3,
//   levels: [...DEFAULT_ZOOM_SCALES],
//   setZoom: () => {},
//   resetZoom: () => {},
//   increaseZoom: () => {},
//   decreaseZoom: () => {},
// })

// export function ZoomProvider({ children }: IChildrenProps) {
//   const [zoom, setZoom] = useState(DEFAULT_ZOOM)

//   return (
//     <ZoomContext.Provider
//       value={{
//         zoom,
//         index: 3,
//         levels: [...DEFAULT_ZOOM_SCALES],
//         setZoom,
//         resetZoom: () => setZoom(DEFAULT_ZOOM),
//         increaseZoom: () =>
//           setZoom(prev => Math.min(prev + 1, DEFAULT_ZOOM_SCALES.length - 1)),
//         decreaseZoom: () => setZoom(prev => Math.max(prev - 1, 0)),
//       }}
//     >
//       {children}
//     </ZoomContext.Provider>
//   )
// }

// export function useZoomCtx(): IZoomContext {
//   const context = useContext(ZoomContext)

//   if (!context) {
//     throw new Error('useZoom must be used within a ZoomProvider')
//   }

//   return {
//     zoom: context.zoom,
//     index: context.index,
//     levels: [...context.levels],
//     setZoom: context.setZoom,
//     resetZoom: context.resetZoom,
//     increaseZoom: context.increaseZoom,
//     decreaseZoom: context.decreaseZoom,
//   }
// }

// function zoomToIndex(zoom: number, levels: number[]): number {
//   for (const [index, level] of levels.slice(0, -1).entries()) {
//     if (zoom >= level && zoom <= levels[index + 1]!) {
//       // fractional index between level and level + 1
//       return index + (zoom - level) / (levels[index + 1]! - level)
//     }
//   }

//   return levels.length - 1
// }

// function findZoomLevel(zc: IZoomChannel, zoom: number) {
//   const { index } = findNearest(zoom, zc.levels)

//   return index
// }

/**
 * Find the next zoom level above the current zoom level and return its index and value.
 * The zoom levels are defined in the zoom channel and are expected to be in ascending order.
 *
 * @param zc
 * @returns
 */
// function increaseZoom(zc: IZoomChannel): { index: number; zoom: number } {
//   // find the next zoom level below the current zoom then add
//   // one to get the index of the next zoom level above the current zoom
//   const newIndex = Math.min(zc.index + 1, zc.levels.length - 1)

//   return { index: newIndex, zoom: zc.levels[newIndex]! }
// }

/**
 * Find the next zoom level below the current zoom level and return its index and value.
 * The zoom levels are defined in the zoom channel and are expected to be in ascending order.
 *
 * @param zc
 * @returns
 */
// function decreaseZoom(zc: IZoomChannel): { index: number; zoom: number } {
//   // find the next zoom level below the current zoom then subtract one to get
//   // the index of the next zoom level below the current zoom
//   const newIndex = Math.max(zc.index - 1, 0)

//   return { index: newIndex, zoom: zc.levels[newIndex]! }
// }
