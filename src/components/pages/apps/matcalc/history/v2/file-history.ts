import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { useSyncExternalStore } from 'react'
import { HistoryPlot } from '../history-provider/history-types'
import { HistoryItem, HistoryOptions, IHistoryItem } from './history-item'

export interface FileState {
  sheets: BaseDataFrame[]
  plots: HistoryPlot[]
}

export class FileHistory implements Omit<
  IHistoryItem<FileState>,
  'commit' | 'reset'
> {
  private history: HistoryItem<FileState>

  constructor(initial: FileState) {
    this.history = new HistoryItem(initial)
  }

  get value(): FileState {
    return this.history.value
  }

  get canUndo(): boolean {
    return this.history.canUndo
  }

  get canRedo(): boolean {
    return this.history.canRedo
  }

  addSheet(sheet: BaseDataFrame, options: HistoryOptions = {}): void {
    const { label = 'Add sheet' } = options

    this.history.commit(
      (draft) => {
        draft.sheets.push(sheet)
      },
      {
        label,
      }
    )
  }

  removeSheet(sheetId: string, options: HistoryOptions = {}): void {
    const { label = 'Remove sheet' } = options
    this.history.commit(
      (draft) => {
        const index = draft.sheets.findIndex((sheet) => sheet.id === sheetId)

        if (index !== -1) {
          draft.sheets.splice(index, 1)
        }
      },
      {
        label,
      }
    )
  }

  updateSheet(sheet: BaseDataFrame, options: HistoryOptions = {}): void {
    const { label = 'Update sheet' } = options

    this.history.commit(
      (draft) => {
        const index = draft.sheets.findIndex((s) => s.id === sheet.id)

        if (index !== -1) {
          draft.sheets[index] = sheet
        }
      },
      {
        label,
      }
    )
  }

  undo(): boolean {
    return this.history.undo()
  }

  redo(): boolean {
    return this.history.redo()
  }

  goto(id: string): boolean {
    return this.history.goto(id)
  }

  clear(): void {
    this.history.clear()
  }

  subscribe(listener: () => void): () => void {
    return this.history.subscribe(listener)
  }
}

export function useFileHistory(item: FileHistory): FileState {
  return useSyncExternalStore(item.subscribe, () => item.value)
}
