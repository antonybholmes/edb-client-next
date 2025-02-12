import { APP_ID } from '@/consts'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import { useEffect } from 'react'
import type { GexPlotPropMap } from './gex-utils'

const localStorageMap = persistentAtom<GexPlotPropMap>(
  `${APP_ID}-gex-plot-settings-v10`,
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

/**
 * Hook for getting and setting props for individual
 * plots.
 *
 * @returns [array of props map (if the array is empty then props are not set,
 * otherwise first element contains props), setter to update props, reset to
 * return to default state]
 */
export function useGexPlotStore(): {
  gexPlotSettings: GexPlotPropMap
  updateGexPlotSettings: (props: GexPlotPropMap) => void
  reset: () => void
} {
  const gexPlotSettings = useStore(localStorageMap)

  useEffect(() => {
    // auto recreate if deleted and app is running
    if (!gexPlotSettings) {
      reset()
    }
  }, [gexPlotSettings])

  function updateGexPlotSettings(props: GexPlotPropMap) {
    localStorageMap.set(props)
  }

  function reset() {
    localStorageMap.set({})
  }

  return { gexPlotSettings, updateGexPlotSettings, reset }
}
