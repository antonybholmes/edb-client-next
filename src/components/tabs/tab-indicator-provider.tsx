import type { IDivProps } from '@/interfaces/div-props'
import { type IRect } from '@/interfaces/rect'
import { createContext, useState } from 'react'

// export interface ITabIndicatorPos {
//   rect: IRect
// }

export interface ITabIndicatorPos extends IRect {
  animate: boolean
  scale: number
  index: number
  tabs: number
}

export interface ITabIndicatorContext {
  position: ITabIndicatorPos | undefined
  //scale: number
  selectedPosition: ITabIndicatorPos | undefined
  //selectedScale: number
  //scale: number
  //index: number
  //setIndex: (index: number, scale: number) => void
  setPosition: (pos: Partial<ITabIndicatorPos> | undefined) => void
  //setScale: (scale: number) => void
  setSelectedPosition: (pos: Partial<ITabIndicatorPos> | undefined) => void
  //setSelectedScale: (scale: number) => void
  //setScale: (scale: number) => void
}

export const TabIndicatorContext = createContext<ITabIndicatorContext>({
  position: undefined,
  //scale: 1,
  selectedPosition: undefined,

  //selectedScale: 1,
  //index: 0,
  //setIndex: () => {},
  //  scale: 0,
  // setScale: () => {},
  setPosition: () => {},
  //setScale: () => {},
  setSelectedPosition: () => {},
  //setSelectedScale: () => {},
})

interface IProps extends IDivProps {
  //index?: number
  position?: ITabIndicatorPos | undefined
  //scale?: number
  selectedPosition?: ITabIndicatorPos | undefined
  //selectedScale?: number
}

export function TabIndicatorProvider({
  //index = 0,
  position = undefined,
  //scale = 1,
  selectedPosition = undefined,
  //selectedScale = 1,
  //scale = 1,
  children,
}: IProps) {
  //const [_index, setIndex] = useState(index)
  //const [_scale, setScale] = useState(scale)

  const [_position, setPosition] = useState<ITabIndicatorPos | undefined>(
    position
  )
  //const [_scale, setScale] = useState<number>(scale)
  const [_selectedPosition, setSelectedPosition] = useState<
    ITabIndicatorPos | undefined
  >(selectedPosition)
  //const [_selectedScale, setSelectedScale] = useState<number>(selectedScale)

  // useEffect(() => {
  //   setPosition(position)
  // }, [position.x, position.y, position.w, position.h])

  // useEffect(() => {
  //   setIndex(index)
  // }, [index])

  // useEffect(() => {
  //   setScale(scale)
  // }, [scale])

  // function setPos(index: number, scale: number) {
  //   // this method is only for when tabs are of fixed
  //   // size. This prevents it interfering with free size
  //   // tabs that use setTabIndicatorPos directly
  //   if (size === 0) {
  //     return
  //   }

  //   const s = size * scale
  //   const x = (index + 0.5) * size - s * 0.5

  //   //const width = tabs[selectedTab.index].size ?? defaultWidth

  //   setTabIndicatorPos({ x, size: s })
  // }

  // function _setIndex(index: number, scale: number) {
  //   setIndex(index)
  //   setScale(scale)
  //   setPos(index, scale)
  // }

  // useEffect(() => {
  //   if (selectedTab) {
  //     _setIndex(selectedTab.index, _scale)
  //   }
  // }, [selectedTab])

  // useEffect(() => {
  //   _setIndex(index, _scale)
  // }, [index])

  // useEffect(() => {
  //   _setIndex(_index, scale)
  // }, [scale])

  // useEffect(() => {
  //   setPos(_index, _scale)
  // }, [_index, _scale, size])

  function _setPosition(pos: Partial<ITabIndicatorPos> | undefined) {
    if (pos !== undefined) {
      setPosition(prev => {
        if (prev) {
          return { ...prev, ...pos }
        } else {
          return {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            animate: true,
            scale: 1,
            index: 0,
            tabs: 0,
            ...pos,
          }
        }
      })
    } else {
      setPosition(undefined)
    }
  }

  function _setSelectedPosition(pos: Partial<ITabIndicatorPos> | undefined) {
    if (pos !== undefined) {
      setSelectedPosition(prev => {
        if (prev) {
          return { ...prev, ...pos }
        } else {
          return {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            animate: true,
            scale: 1,
            index: 0,
            tabs: 0,
            ...pos,
          }
        }
      })
    } else {
      setSelectedPosition(undefined)
    }
  }

  return (
    <TabIndicatorContext.Provider
      value={{
        position: _position,
        //scale: _scale,
        selectedPosition: _selectedPosition,
        //selectedScale: _selectedScale,
        //index: _index,
        //scale: _scale,
        //setIndex,
        //setScale,
        setPosition: _setPosition,
        //setScale,
        setSelectedPosition: pos => _setSelectedPosition(pos),
        //setSelectedScale,
      }}
    >
      {children}
    </TabIndicatorContext.Provider>
  )
}
