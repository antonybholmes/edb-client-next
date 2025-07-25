import type { IDivProps } from '@interfaces/div-props'
import { createContext, useEffect, useState } from 'react'

export interface ITabIndicatorPos {
  x: number | string
  size: number | string
}

export interface IZoomContext {
  zoom: number

  setZoom: (zoom: number) => void
}

export const ZoomContext = createContext<IZoomContext>({
  zoom: 1,
  setZoom: () => {},
})

interface IProps extends IDivProps {
  zoom?: number
}

export function ZoomProvider({ zoom = 1, children }: IProps) {
  const [_zoom, setZoom] = useState(zoom)

  useEffect(() => {
    setZoom(zoom)
  }, [zoom])

  return (
    <ZoomContext.Provider
      value={{
        zoom: _zoom,
        setZoom,
      }}
    >
      {children}
    </ZoomContext.Provider>
  )
}
