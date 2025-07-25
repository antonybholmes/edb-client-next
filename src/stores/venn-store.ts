import { APP_ID } from '@/consts'
import { COLOR_WHITE } from '@lib/color/color'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

export const PLOT_W = 600

export interface IVennStore {
  showCounts: boolean
  showLabels: boolean
  w: number
  scale: number
  isProportional: boolean
  isFilled: boolean
  isOutlined: boolean
  intersectionColor: string
  autoColorText: boolean
  normalize: boolean
}

const DEFAULT_SETTINGS: IVennStore = {
  w: PLOT_W,
  scale: 1,
  isProportional: false,
  isFilled: true,
  isOutlined: false,
  intersectionColor: COLOR_WHITE,
  autoColorText: true,
  showLabels: true,
  showCounts: true,
  normalize: false,
}

// const DEFAULT_VENN_STORE = {
//   w: PLOT_W.toString(),
//   scale: "1",
//   isProportional: FALSE,
//   isFilled: TRUE,
//   isOutlined: FALSE,
//   intersectionColor: "#ffffff",
//   autoColorText: TRUE,
//   showLabels: TRUE,
//   showCounts: TRUE,
//   normalize: FALSE,
// }

//const localStorageMap = persistentMap("venn:", { ...DEFAULT_VENN_STORE })

const localStorageMap = persistentAtom<IVennStore>(
  `${APP_ID}:module:venn:settings:v1`,
  {
    ...DEFAULT_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useVennStore(): [
  IVennStore,
  (store: IVennStore) => void,
  () => void,
] {
  const settings = useStore(localStorageMap)

  //const [vennStore, setVennStore] = useState<IVennStore>({ ...DEFAULT_SETTINGS })

  // useEffect(() => {
  //   // update from store
  //   setVennStore({
  //     w: parseInt(localStore.w),
  //     scale: parseFloat(localStore.scale),
  //     isProportional: localStore.isProportional === TRUE,
  //     isFilled: localStore.isFilled === TRUE,
  //     isOutlined: localStore.isOutlined === TRUE,
  //     intersectionColor: localStore.intersectionColor,
  //     autoColorText: localStore.autoColorText === TRUE,
  //     showLabels: localStore.showLabels === TRUE,
  //     showCounts: localStore.showCounts === TRUE,
  //     normalize: localStore.normalize === TRUE,
  //   })
  // }, [])

  // useEffect(() => {
  //   // Write to store when there are changes
  //   localStorageMap.set({
  //     w: vennStore.w.toString(),
  //     scale: vennStore.scale.toString(),
  //     isProportional: vennStore.isProportional.toString(),
  //     isFilled: vennStore.isFilled.toString(),
  //     isOutlined: vennStore.isOutlined.toString(),
  //     intersectionColor: vennStore.intersectionColor,
  //     autoColorText: vennStore.autoColorText.toString(),
  //     showLabels: vennStore.showLabels.toString(),
  //     showCounts: vennStore.showCounts.toString(),
  //     normalize: vennStore.normalize.toString(),
  //   })
  // }, [vennStore])

  function update(settings: IVennStore) {
    localStorageMap.set(settings)
  }

  function reset() {
    update({ ...DEFAULT_SETTINGS })
  }

  return [settings, update, reset]
}
