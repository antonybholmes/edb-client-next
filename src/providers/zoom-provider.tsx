'use client'

import { ILimit } from '@/lib/math/limit'

import { useCallback, useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export const DEFAULT_ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 2, 3, 4]
export const DEFAULT_ZOOM_LIMIT: ILimit = { min: 0.1, max: 4 }

interface IZoomContext {
  zoom: number
  //index: number
  levels: number[]
  setZoom: (zoom: number) => void
  increaseZoom: () => void
  decreaseZoom: () => void
  resetZoom: () => void
}

interface IZoomChannel {
  id: string
  zoom: number
  //index: number
  levels: number[]
  limit: ILimit
}

const STORAGE_KEY = 'zoom-channels:v8'

export const DEFAULT_ZOOM_CHANNEL_NAME = 'default'

export const DEFAULT_ZOOM_CHANNEL: IZoomChannel = {
  id: DEFAULT_ZOOM_CHANNEL_NAME,
  zoom: 1,
  //index: 3, // corresponds to 1x zoom in DEFAULT_ZOOM_SCALES
  levels: DEFAULT_ZOOM_LEVELS,
  limit: DEFAULT_ZOOM_LIMIT,
}

export interface IZoomStore {
  zooms: Record<string, IZoomChannel>
  //initializeZoom: (id: string, defaults?: IZoomChannel) => void
  setZoom: (id: string, value: number) => number
  resetZoom: (id: string) => void
  increaseZoom: (id: string) => { index: number; zoom: number }
  decreaseZoom: (id: string) => { index: number; zoom: number }
  resetAll: () => void
}

export const DEFAULT_ZOOM = 1

export const useZoomStore = create<IZoomStore>()(
  persist(
    (set, get) => ({
      zooms: { [DEFAULT_ZOOM_CHANNEL_NAME]: { ...DEFAULT_ZOOM_CHANNEL } },

      // initializeZoom: (id, defaults = DEFAULT_ZOOM_CHANNEL) => {
      //   set((state) => {
      //     if (state.zooms[id]) return state

      //     return {
      //       zooms: {
      //         ...state.zooms,
      //         [id]: { ...defaults, id },
      //       },
      //     }
      //   })
      // },

      setZoom: (id, value) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

        if (value === zc.zoom) {
          return zc.zoom
        }

        const zoomLevel = findZoomLevel(zc, value)
        const newZoom = zc.levels[zoomLevel]

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: {
                ...zc,
                zoom: newZoom,
              },
            },
          }
        })
        return newZoom
      },
      increaseZoom: (id) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }
        let { index } = increaseZoom(zc)

        const newZoom = zc.levels[index]

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: { ...zc, zoom: newZoom },
            },
          }
        })

        return { index, zoom: newZoom }
      },
      decreaseZoom: (id) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }
        const { index } = decreaseZoom(zc)

        const newZoom = zc.levels[index]

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: { ...zc, zoom: newZoom },
            },
          }
        })

        return { index, zoom: newZoom }
      },
      resetZoom: (channel) => {
        set((state) => {
          const zooms = { ...state.zooms }
          delete zooms[channel]

          return { zooms }
        })

        //return 1
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
): IZoomContext & { index: number } {
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

  const index = useMemo(() => findZoomLevel(z, z.zoom), [z])

  const setZoom = useZoomStore((state) => state.setZoom)
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
    index,
    levels: [...z.levels],
    increaseZoom: incrementChannelZoom,
    decreaseZoom: decrementChannelZoom,
    setZoom: setChannelZoom,
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

function findZoomLevel(zc: IZoomChannel, zoom: number) {
  if (zoom <= zc.levels[0]!) {
    return 0
  }

  if (zoom >= zc.levels[zc.levels.length - 1]!) {
    return zc.levels.length - 1
  }

  let lo = 0
  let hi = zc.levels.length - 1

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)

    if (zc.levels[mid] <= zoom) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return lo - 1
}

/**
 * Find the next zoom level above the current zoom level and return its index and value.
 * The zoom levels are defined in the zoom channel and are expected to be in ascending order.
 *
 * @param zc
 * @returns
 */
function increaseZoom(zc: IZoomChannel): { index: number; zoom: number } {
  // find the next zoom level below the current zoom then add
  // one to get the index of the next zoom level above the current zoom
  const newIndex = Math.min(
    findZoomLevel(zc, zc.zoom) + 1,
    zc.levels.length - 1
  )

  return { index: newIndex, zoom: zc.levels[newIndex]! }
}

/**
 * Find the next zoom level below the current zoom level and return its index and value.
 * The zoom levels are defined in the zoom channel and are expected to be in ascending order.
 *
 * @param zc
 * @returns
 */
function decreaseZoom(zc: IZoomChannel): { index: number; zoom: number } {
  // find the next zoom level below the current zoom then subtract one to get
  // the index of the next zoom level below the current zoom
  const newIndex = Math.max(findZoomLevel(zc, zc.zoom) - 1, 0)

  return { index: newIndex, zoom: zc.levels[newIndex]! }
}
