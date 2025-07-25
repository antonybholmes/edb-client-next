import type { IDivProps } from '@interfaces/div-props'
import { createContext, useState } from 'react'

export interface ITabIndicatorPos {
  x: number | string
  size: number | string
}

export interface ITabIndicatorContext {
  size: number
  index: number
  setIndex: (index: number, scale: number) => void
  scale: number

  tabIndicatorPos: ITabIndicatorPos
  setTabIndicatorPos: (pos: ITabIndicatorPos) => void
}

export const TabIndicatorContext = createContext<ITabIndicatorContext>({
  size: 0,
  index: 0,
  setIndex: () => {},
  scale: 0,

  tabIndicatorPos: { x: 0, size: 0 },
  setTabIndicatorPos: () => {},
})

interface IProps extends IDivProps {
  index?: number
  size?: number
  scale?: number
}

export function TabIndicatorProvider({
  index = 0,
  size = 0,
  scale = 1,
  children,
}: IProps) {
  const [_index, setIndex] = useState(index)
  const [_scale, setScale] = useState(scale)

  const [tabIndicatorPos, setTabIndicatorPos] = useState<ITabIndicatorPos>({
    x: 0,
    size: 0,
  })

  function setPos(index: number, scale: number) {
    // this method is only for when tabs are of fixed
    // size. This prevents it interfering with free size
    // tabs that use setTabIndicatorPos directly
    if (size === 0) {
      return
    }

    const s = size * scale
    const x = (index + 0.5) * size - s * 0.5

    //const width = tabs[selectedTab.index].size ?? defaultWidth

    setTabIndicatorPos({ x, size: s })
  }

  function _setIndex(index: number, scale: number) {
    setIndex(index)
    setScale(scale)
    setPos(index, scale)
  }

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

  return (
    <TabIndicatorContext.Provider
      value={{
        size,
        index: _index,
        setIndex: _setIndex,
        scale: _scale,

        tabIndicatorPos,
        setTabIndicatorPos,
      }}
    >
      {children}
    </TabIndicatorContext.Provider>
  )
}
