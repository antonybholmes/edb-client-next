import { ITextFileOpen } from '@/components/pages/open-files'
import {
  IClusterGroup,
  IClusterGroupRow,
  makeNewGroup,
} from '@/lib/cluster-group'
import { randomHexColor } from '@/lib/color/color'
import { makeUuid } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'
import { textJoin } from '@/lib/text/text'
import { DEFAULT_FILE } from '../history-init'
import { IHistoryData, IHistoryState, PathId } from '../history-types'
import { HistoryAction } from './action-types'
import { applyHistoryUpdate } from './shared'

export function removeGroup(state: IHistoryState, p: PathId) {
  state.groupRows[p.file] = state.groupRows[p.file]!.map((row) => {
    row.groups = row.groups.filter((g) => g.id !== p.group)
    return row
  })
}

export function handleAddGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addGroups' }>
): IHistoryData {
  const { groupRows, opts } = action
  const { file = state.present.currentFile, mode = 'set' } = opts

  // cannot add groups to default file and empty groups array does not require update
  if (groupRows.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Add ${textJoin(groupRows.map((gs) => gs.name))} group${
      groupRows.length > 1 ? 's' : ''
    }`,
    '',
    (draft: IHistoryState) => {
      if (mode === 'append') {
        draft.groupRows[file]?.push(...groupRows)
      } else {
        draft.groupRows[file] = groupRows
      }
    }
  )
}

export function handleClearGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'clearGroups' }>
): IHistoryData {
  const { opts } = action
  const { file = state.present.currentFile } = opts

  // cannot add groups to default file and empty groups array does not require update
  if (file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    'Clear groups',
    '',
    (draft: IHistoryState) => {
      draft.groupRows[file] = []
    }
  )
}

export function openGroupFiles(files: ITextFileOpen[]): IClusterGroupRow[] {
  if (files.length === 0) {
    return []
  }

  const f0 = files[0]!

  let groupRows: IClusterGroupRow[] = []

  if (f0.ext === 'json') {
    const g = JSON.parse(f0.text)

    // v1
    if (Array.isArray(g)) {
      groupRows = g
    } else {
      // v2 for storing group rows
      groupRows = g.groupRows
    }
  } else {
    // open cls
    const lines = textToLines(f0.text)

    if (lines.length < 3) {
      return groupRows
    }

    const names = lines[1]?.split(' ').slice(1)

    if (!names) {
      return groupRows
    }

    // store lowercase for case insensitive searching
    const columnNames = lines[2]?.split(/[ \t]/).map((x) => x.toLowerCase())

    if (!columnNames) {
      return groupRows
    }

    const groups: IClusterGroup[] = []

    for (const name of names) {
      groups.push(
        makeNewGroup({
          name,
          search: [name.toLowerCase()],
          color: randomHexColor(),
          columnNames,
        })
      )
    }

    groupRows = [{ id: makeUuid(), name: 'Groups', groups }]
  }

  return groupRows
}

export function handleOpenGroupFiles(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'openGroupFiles' }>
) {
  const { files, opts } = action
  const { file = state.present.currentFile } = opts

  const groupRows: IClusterGroupRow[] = openGroupFiles(files)

  if (groupRows.length === 0) {
    return state
  }

  return applyHistoryUpdate(
    state,
    'Clear groups',
    '',
    (draft: IHistoryState) => {
      draft.groupRows[file] = groupRows
    }
  )
}

export function handleUpdateGroup(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updateGroup' }>
): IHistoryData {
  const { group, opts } = action
  const { file = state.present.currentFile } = opts

  return applyHistoryUpdate(
    state,
    'Update group',
    '',
    (draft: IHistoryState) => {
      for (let gr of draft.groupRows[file] ?? []) {
        for (let i = 0; i < gr.groups.length; i++) {
          if (gr.groups[i].id === group.id) {
            gr.groups[i] = group
          }
        }
      }
    }
  )
}

export function handleRemoveGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeGroups' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile } = opts
  // cannot remove groups from default file and empty ids array does not require update
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(state, 'Remove groups', '', (draft) => {
    // remove group rows matching these ids
    draft.groupRows[file] = draft.groupRows[file]?.filter(
      (gr) => !ids.includes(gr.id)
    )

    // remove any groups matching the ids
    for (let gr of draft.groupRows[file] ?? []) {
      gr.groups = gr.groups.filter((g) => !ids.includes(g.id))
    }
  })
}
