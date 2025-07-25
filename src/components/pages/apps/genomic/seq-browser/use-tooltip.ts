import { useEffect, useState } from 'react'
import type { ISeqPos } from './svg/base-seq-track-svg'

export const NO_TRACK_TOOLTIP: ISeqPos = {
  x: -1,
  y: -1,
  realY: 0,
  start: 0,
  end: 0,
}

interface IGlobalState {
  tooltip: ISeqPos
  listeners: Array<(search: ISeqPos) => void>
}

const globalState: IGlobalState = {
  tooltip: NO_TRACK_TOOLTIP,
  listeners: [],
}

export function tooltipDispatch(tooltip: ISeqPos) {
  for (const listener of globalState.listeners) {
    listener(tooltip)
  }
}

export function addListener(listener: (tooltip: ISeqPos) => void) {
  globalState.listeners.push(listener)
  // Return a function to remove the listener
  return () => {
    globalState.listeners = globalState.listeners.filter(l => l !== listener)
  }
}

export function useTooltip(): {
  tooltip: ISeqPos
  setTooltip: (search: ISeqPos) => void
} {
  const [tooltip, setTooltip] = useState(globalState.tooltip)

  useEffect(() => {
    // Add this component as a listener to the global state
    const removeListener = addListener((tooltip: ISeqPos) => {
      //console.log(id, messages)

      // By using the spread operator ([...]), you're ensuring that you're not mutating
      // the original array (newMessages). Instead, you're creating a new array. This
      // new array has a new reference, and React can detect that the state has changed.
      setTooltip(tooltip)
    })

    // Clean up the listener when the component is unmounted
    return () => {
      removeListener()
    }
  }, [])

  return {
    tooltip,
    setTooltip: tooltipDispatch,
  }
}
