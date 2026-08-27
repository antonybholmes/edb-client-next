import { DEFAULT_FILE } from '../history-init'
import { IHistoryData, IHistoryState, PathId } from '../history-types'
import { HistoryAction } from './action-types'
import { applyHistoryUpdate } from './shared'

export function removePlot(state: IHistoryState, p: PathId) {
  state.plots[p.file] = state.plots[p.file]!.filter(
    (plot) => plot.id !== p.plot
  )

  if (state.plots[p.file]!.length > 0) {
    // if there are still plots left, select the previous one
    const plots = state.plots[p.file]!
    state.currentPlot = plots[0]!
    state.currentSelections = [{ type: 'plot', id: state.currentPlot.id }]
  } else {
    // otherwise select the last sheet
    const sheets = state.sheets[p.file]!
    state.currentPlot = undefined
    state.currentSheet = sheets[0]!
    state.currentSelections = [{ type: 'sheet', id: state.currentSheet.id }]
  }
}

export function handleAddPlots(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addPlots' }>
): IHistoryData {
  const { plots, opts } = action
  const {
    name = '',
    mode = 'append',
    file = state.present.currentFile.id,
  } = opts || {}
  if (plots.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    name ||
      (plots.length === 1
        ? `Add plot ${plots[0]!.name}`
        : `Add ${plots.length} plots`),
    '',
    (draft: IHistoryState) => {
      if (mode === 'append') {
        draft.plots[file]?.push(...plots)
      } else {
        draft.plots[file] = plots
      }

      draft.currentPlot = plots[0]!
      draft.currentSelections = [{ type: 'plot', id: plots[0]!.id }]
    }
  )
}

export function handleUpdatePlot(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updatePlot' }>
): IHistoryData {
  const { plot, opts } = action
  const { file = state.present.currentFile.id } = opts

  return applyHistoryUpdate(
    state,
    'Update group',
    '',
    (draft: IHistoryState) => {
      const filePlots = draft.plots[file] ?? []

      for (let i = 0; i < filePlots.length; i++) {
        if (filePlots![i].id === plot.id) {
          filePlots![i] = plot
        }
      }
    }
  )
}
