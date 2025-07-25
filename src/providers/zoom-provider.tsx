// import { useEffect, useState } from 'react'

import type { IChildrenProps } from '@/interfaces/children-props'
import { createContext, useContext, useState } from 'react'

// interface IGlobalState {
//   zoom: number
//   listeners: Array<(zoom: number) => void>
// }

// const globalState: IGlobalState = {
//   zoom: 1,
//   listeners: [],
// }

// export function zoomDispatch(zoom: number) {
//   globalState.zoom = zoom
//   for (const listener of globalState.listeners) {
//     listener(zoom)
//   }
// }

// export function addListener(listener: (zoom: number) => void) {
//   globalState.listeners.push(listener)
//   // Return a function to remove the listener
//   return () => {
//     globalState.listeners = globalState.listeners.filter(l => l !== listener)
//   }
// }

// export function useZoom(): {
//   zoom: number
//   setZoom: (zoom: number) => void
// } {
//   const [zoom, setZoom] = useState(globalState.zoom)

//   useEffect(() => {
//     // Add this component as a listener to the global state
//     const removeListener = addListener((zoom: number) => {
//       //console.log(id, messages)

//       // By using the spread operator ([...]), you're ensuring that you're not mutating
//       // the original array (newMessages). Instead, you're creating a new array. This
//       // new array has a new reference, and React can detect that the state has changed.
//       setZoom(zoom)
//     })

//     // Clean up the listener when the component is unmounted
//     return () => {
//       removeListener()
//     }
//   }, [])

//   return {
//     zoom,
//     setZoom: zoomDispatch,
//   }
// }

// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

interface IZoomStore {
  zoom: number
  setZoom: (zoom: number) => void
}

// const useZoomStore = create<IZoomStore>()(
//   persist(
//     set => ({
//       zoom: 1,
//       setZoom: (zoom: number) => set({ zoom }),
//     }),
//     {
//       name: 'zoom', // key in localStorage
//     }
//   )
// )

// export function useZoom(): IZoomStore {
//   const zoom = useZoomStore(state => state.zoom)
//   const setZoom = useZoomStore(state => state.setZoom)

//   return { zoom, setZoom }
// }

const DEFAULT_ZOOM = 1

const ZoomContext = createContext<IZoomStore>({
  zoom: DEFAULT_ZOOM,
  setZoom: () => {},
})

export function ZoomProvider({ children }: IChildrenProps) {
  // const [zoom, setZoom] = useState(() => {
  //   const stored = localStorage.getItem('zoom')
  //   return stored ? JSON.parse(stored) : DEFAULT_ZOOM
  // })

  // useEffect(() => {
  //   localStorage.setItem('zoom', JSON.stringify(zoom))
  // }, [zoom])

  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  return (
    <ZoomContext.Provider value={{ zoom, setZoom }}>
      {children}
    </ZoomContext.Provider>
  )
}

export function useZoom(): IZoomStore {
  const context = useContext(ZoomContext)
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider')
  }
  return { zoom: context.zoom, setZoom: context.setZoom }
}
