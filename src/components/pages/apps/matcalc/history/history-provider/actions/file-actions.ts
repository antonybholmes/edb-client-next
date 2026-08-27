import { getFormattedShapeSmall } from '@/lib/dataframe/dataframe-utils'
import { DEFAULT_FILE } from '../history-init'
import { IHistoryData, IHistoryState, PathId } from '../history-types'
import { HistoryAction } from './action-types'
import { applyHistoryUpdate, toPathId } from './shared'

export function removeFile(state: IHistoryState, p: PathId) {
  state.files = state.files.filter((file) => file.id !== p.file)

  delete state.sheets[p.file]
  delete state.plots[p.file]
  delete state.groupRows[p.file]
  delete state.genesets[p.file]

  if (state.files.length === 0) {
    // if there are no files left, reset to initial state
    state.files = [DEFAULT_FILE]
  }

  // select previous sheet/plot

  const lastFile = state.files[state.files.length - 1]!.id

  state.currentFile = lastFile
  const sheets = state.sheets[lastFile]!
  state.currentSheet = sheets[0].id
  state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
}

export function handleOpenFile(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'openFile' }>
): IHistoryData {
  return applyHistoryUpdate(
    state,
    `Open file ${action.file.name}`,
    getFormattedShapeSmall(action.sheets[0]),
    (draft: IHistoryState) => {
      if (action.mode === 'append') {
        const files = draft.files.filter((file) => file.id !== DEFAULT_FILE.id)
        draft.files = [...files, action.file]
      } else {
        draft.sheets = {}
        draft.plots = {}
        draft.axes = {}
        draft.groupRows = {}
        draft.genesets = {}
        draft.files = [action.file]
      }

      draft.sheets[action.file.id] = action.sheets
      draft.plots[action.file.id] = action.plots
      draft.groupRows[action.file.id] = action.groupRows
      draft.genesets[action.file.id] = action.genesets

      draft.currentFile = action.file.id
      draft.currentSheet = action.sheets[0].id
      draft.currentPlot =
        action.plots.length > 0 ? action.plots[0]!.id : undefined
      draft.currentSelections = [{ type: 'sheet', id: action.sheets[0]!.id }]
    }
  )
}

export function handleRemoveFiles(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeFiles' }>
): IHistoryData {
  if (action.paths.length === 0) {
    return state
  }

  const pathIds = action.paths.map(toPathId)
  return applyHistoryUpdate(
    state,
    `Remove ${pathIds.length} file${pathIds.length > 1 ? 's' : ''}`,
    '',
    (draft: IHistoryState) => {
      for (const p of pathIds) {
        removeFile(draft, p)
      }
    }
  )
}
