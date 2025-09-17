import { APP_ID } from '@/consts'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

export interface IVennCircleProps {
  name: string
  fill: string
  stroke: string
  color: string
  fillOpacity: number
  strokeOpacity: number
}

export const DEFAULT_VENN_CIRCLE_PROPS = {
  fill: '#cccccc',
  stroke: COLOR_BLACK,
  color: COLOR_WHITE,
}

export type VennCirclesMap = { [key: string]: IVennCircleProps }

export const DEFAULT_CIRCLES: IVennCircleProps[] = [
  {
    name: 'A',
    fill: '#ff0000',
    stroke: '#ff0000',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  {
    name: 'B',
    fill: '#008000',
    stroke: '#008000',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  {
    name: 'C',
    fill: '#0000ff',
    stroke: '#0000ff',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  {
    name: 'D',
    fill: '#FFA500',
    stroke: '#FFA500',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
]

export const DEFAULT_CIRCLE_MAP: VennCirclesMap = {
  0: {
    name: 'A',
    fill: '#ff0000',
    stroke: '#ff0000',
    color: COLOR_WHITE,
    fillOpacity: 0.5,
    strokeOpacity: 1,
  },
  1: {
    name: 'B',
    fill: '#008000',
    stroke: '#008000',
    color: COLOR_WHITE,
    fillOpacity: 0.5,
    strokeOpacity: 1,
  },
  2: {
    name: 'C',
    fill: '#0000ff',
    stroke: '#0000ff',
    color: COLOR_WHITE,
    fillOpacity: 0.5,
    strokeOpacity: 1,
  },
  3: {
    name: 'D',
    fill: '#FFA500',
    stroke: '#FFA500',
    color: COLOR_WHITE,
    fillOpacity: 0.5,
    strokeOpacity: 1,
  },
}

// const localStorageColors = persistentMap("venn:", {
//   colors: JSON.stringify(DEFAULT_VENN_CIRCLES_PROPS),
// })

const vennAtom = persistentAtom<VennCirclesMap>(
  `${APP_ID}:module:venn:venn-circles:settings:v1`,
  {
    ...DEFAULT_CIRCLE_MAP,
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
  const settings = useStore(vennAtom)

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
    vennAtom.set(settings)
  }

  function reset() {
    update({ ...DEFAULT_CIRCLE_MAP })
  }

  return [settings, update, reset]
}
