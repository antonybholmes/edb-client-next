import { APP_ID, COLOR_BLACK, COLOR_WHITE } from '@/consts'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

export interface IVennCircleProps {
  fill: string
  stroke: string
  color: string
}

export const DEFAULT_VENN_CIRCLE_PROPS = {
  fill: '#cccccc',
  stroke: COLOR_BLACK,
  color: COLOR_WHITE,
}

export type VennCirclesMap = { [key: string]: IVennCircleProps }

export const DEFAULT_SETTINGS: VennCirclesMap = {
  0: { fill: '#ff000050', stroke: '#ff0000c0', color: COLOR_WHITE },
  1: { fill: '#00800050', stroke: '#008000c0', color: COLOR_WHITE },
  2: { fill: '#0000ff50', stroke: '#0000ffc0', color: COLOR_WHITE },
  3: { fill: '#FFA50050', stroke: '#FFA500c0', color: COLOR_WHITE },
}

// const localStorageColors = persistentMap("venn:", {
//   colors: JSON.stringify(DEFAULT_VENN_CIRCLES_PROPS),
// })

const localStorageMap = persistentAtom<VennCirclesMap>(
  `${APP_ID}-venn-circles-v1`,
  {
    ...DEFAULT_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useVennCircleStore(): [
  VennCirclesMap,
  (colorMap: VennCirclesMap) => void,
  () => void,
] {
  const settings = useStore(localStorageMap)

  // const [colorMap, setColorMap] = useState<IVennCirclesMap>(
  //   new Map(DEFAULT_VENN_CIRCLES_PROPS),
  // )

  // useEffect(() => {
  //   // update from store
  //   setColorMap(
  //     new Map<number, IVennCircleProps>(
  //       localStore ? JSON.parse(localStore.colors) : [],
  //     ),
  //   )
  // }, [])

  // useEffect(() => {
  //   // Write to store when there are changes
  //   localStorageColors.setKey(
  //     "colors",
  //     JSON.stringify(Array.from(colorMap.entries())),
  //   )
  // }, [colorMap])

  // function reset() {
  //   setColorMap(new Map(DEFAULT_VENN_CIRCLES_PROPS))
  // }

  // function update(settings: [number, IVennCircleProps][]) {
  //   localStorageMap.set(settings)
  // }

  // function reset() {
  //   update({ ...DEFAULT_SETTINGS })
  // }

  function update(settings: VennCirclesMap) {
    localStorageMap.set(settings)
  }

  function reset() {
    update({ ...DEFAULT_SETTINGS })
  }

  return [settings, update, reset]
}
