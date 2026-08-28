import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'
import { DEFAULT_FILE, DEFAULT_SHEET } from '../history-init'
import { IHistoryData, IHistoryState, PathId } from '../history-types'
import { HistoryAction } from './action-types'
import { applyHistoryUpdate } from './shared'

export function removeSheet(state: IHistoryState, p: PathId) {
  // cannot remove the first sheet
  if ((state.sheets[p.file]?.length || 0) < 2) {
    return
  }

  state.sheets[p.file] = state.sheets[p.file]!.filter(
    (sheet) => sheet.id !== p.sheet
  )

  const sheets = state.sheets[p.file]!
  state.currentSheet = sheets[0]!.id
  state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
}

export function handleAddSheets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addSheets' }>
): IHistoryData {
  const { sheets, opts } = action
  const {
    message: name = '',
    mode = 'set',
    file = state.present.currentFile,
  } = opts
  if (sheets.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  const title =
    name ||
    (sheets.length === 1
      ? `Add sheet ${sheets[0]!.name}`
      : `Add ${sheets.length} sheets`)

  return applyHistoryUpdate(
    state,
    title,
    getFormattedShape(sheets[0]!),
    (draft: IHistoryState) => {
      if (mode === 'append') {
        const existing = (draft.sheets[file] || []).filter(
          (f) => f.id !== DEFAULT_SHEET.id
        )
        draft.sheets[file] = [...existing, ...sheets]
      } else {
        draft.sheets[file] = sheets
      }

      draft.currentSheet = sheets[0].id
      draft.currentSelections = [{ type: 'sheet', id: sheets[0]!.id }]
    }
  )
}

export function handleReorderSheets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'reorderSheets' }>
): IHistoryData {
  const { sheets, opts } = action
  const { file = state.present.currentFile } = opts

  // default file cannot be reordered
  if (sheets.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(state, 'Reorder sheets', '', (draft) => {
    draft.sheets[file] = sheets
  })
}
