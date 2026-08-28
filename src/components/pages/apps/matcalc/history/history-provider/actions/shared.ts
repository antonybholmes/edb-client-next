import { PATH_SEP } from '@/lib/http/urls'
import { UndefNullStr } from '@/lib/text/text'
import { HistoryManager } from '../history-manager'
import {
  IHistoryData,
  IHistoryState,
  PathId,
  StrOrIdObj,
} from '../history-types'

// shared undo/redo manager used by all action handlers
export const historyManager = new HistoryManager<IHistoryState>()

export function getPathType(
  path: PathId
): 'file' | 'sheet' | 'plot' | 'group' | 'geneset' {
  if (path.geneset) {
    return 'geneset'
  } else if (path.plot) {
    return 'plot'
  } else if (path.group) {
    return 'group'
  } else if (path.sheet) {
    return 'sheet'
  } else {
    return 'file'
  }
}

/**
 * Convert a string or an object with an id property to a string ID.
 * This is useful for functions that can accept either an ID string or an
 * object with an ID, allowing for more flexible input while ensuring
 * that the output is always a consistent string ID.
 *
 * @param strOrId
 * @returns
 */
export function strOrIdToStr(strOrId: StrOrIdObj): string {
  return typeof strOrId === 'string' ? strOrId : strOrId.id
}

export function pathJoin(...parts: ({ id: string } | UndefNullStr)[]): string {
  return (
    '/' +
    parts
      .filter((part) => part !== null && part !== undefined)
      .map((part) => (typeof part === 'string' ? part.trim() : part.id))
      .map((part) => part.split(PATH_SEP))
      .flat() // split parts by path separator to avoid issues with nested paths and flatten the result

      .filter((p, pi) => pi > 0 || p !== '') // remove empty leading
      .join(PATH_SEP)
  )
}

/**
 * Normalizes a path object which contains keys mapping to
 * either strings or objects with id property to a set of
 * (possibly empty) strings for each level of the path.
 *
 * @param path
 * @returns
 */
export function toPathId(path: Record<string, StrOrIdObj>): PathId {
  const file = 'file' in path ? strOrIdToStr(path.file) : ''
  const sheet = 'sheet' in path ? strOrIdToStr(path.sheet) : ''
  const plot = 'plot' in path ? strOrIdToStr(path.plot) : ''
  const group = 'group' in path ? strOrIdToStr(path.group) : ''
  const geneset = 'geneset' in path ? strOrIdToStr(path.geneset) : ''

  return { file, sheet, plot, group, geneset }
}

export function applyHistoryUpdate(
  state: IHistoryData,
  name: string,
  description: string,
  updateHistory: (state: IHistoryState) => void
): IHistoryData {
  const result = historyManager.applyUpdate(
    state,
    name,
    description,
    (draft: IHistoryState) => {
      updateHistory(draft)
    }
  )

  if (result === state) {
    return state
  }

  return {
    ...state,
    ...result,
  }
}
