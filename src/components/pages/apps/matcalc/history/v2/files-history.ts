import { IClusterGroupRow } from '@/lib/cluster-group'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { IGeneSet } from '@/lib/gsea/geneset'
import { makeUuid } from '@/lib/id'
import { useSyncExternalStore } from 'react'
import { HistoryPlot } from '../history-provider/history-types'
import { HistoryItem, HistoryOptions, IHistoryItem } from './history-item'

export interface FileState {
  id: string
  sheets: BaseDataFrame[]
  plots: HistoryPlot[]
  groups: IClusterGroupRow[]
  genesets: IGeneSet[]
  timestamp: number
}

const DEFAULT_FILE_STATE: Omit<FileState, 'id' | 'timestamp'> = {
  sheets: [],
  plots: [],
  groups: [],
  genesets: [],
}

export interface FilesState {
  files: FileState[]
}

export class FilesHistory implements Omit<
  IHistoryItem<FilesState>,
  'commit' | 'reset'
> {
  private readonly history: HistoryItem<FilesState>

  constructor(initial: FilesState = { files: [] }) {
    this.history = new HistoryItem(initial)
  }

  get value(): FilesState {
    return this.history.value
  }

  get canUndo(): boolean {
    return this.history.canUndo
  }

  get canRedo(): boolean {
    return this.history.canRedo
  }

  getFile(fileId: string): FileState | undefined {
    return this.history.value.files.find((file) => file.id === fileId)
  }

  addFile(state: FileState, options: HistoryOptions = {}): void {
    const { label = 'Add file' } = options

    this.history.commit(
      (draft) => {
        draft.files.push(state)
      },
      { label }
    )
  }

  removeFile(fileId: string, options: HistoryOptions = {}): void {
    const { label = 'Remove file' } = options
    this.history.commit(
      (draft) => {
        const index = draft.files.findIndex((file) => file.id === fileId)

        if (index !== -1) {
          draft.files.splice(index, 1)
        }
      },
      { label }
    )
  }

  addSheet(
    fileId: string,
    sheet: BaseDataFrame,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Add sheet' } = options
    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          file.sheets.push(sheet)
        }
      },
      { label }
    )
  }

  removeSheet(
    fileId: string,
    sheetId: string,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Remove sheet' } = options

    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          const index = file.sheets.findIndex((sheet) => sheet.id === sheetId)

          if (index !== -1) {
            file.sheets.splice(index, 1)
          }
        }
      },
      { label }
    )
  }

  updateSheet(
    fileId: string,
    sheet: BaseDataFrame,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Update sheet' } = options
    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          const index = file.sheets.findIndex(
            (candidate) => candidate.id === sheet.id
          )

          if (index !== -1) {
            file.sheets[index] = sheet
          }
        }
      },
      { label }
    )
  }

  addGroup(
    fileId: string,
    group: IClusterGroupRow,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Add group' } = options
    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          file.groups.push(group)
        }
      },
      { label }
    )
  }

  removeGroup(
    fileId: string,
    groupId: string,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Remove group' } = options
    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          const index = file.groups.findIndex((group) => group.id === groupId)

          if (index !== -1) {
            file.groups.splice(index, 1)
          }
        }
      },
      { label }
    )
  }

  updateGroup(
    fileId: string,
    group: IClusterGroupRow,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Update group' } = options
    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          const index = file.groups.findIndex(
            (candidate) => candidate.id === group.id
          )

          if (index !== -1) {
            file.groups[index] = group
          }
        }
      },
      { label }
    )
  }

  addGeneSet(
    fileId: string,
    geneset: IGeneSet,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Add geneset' } = options
    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          file.genesets.push(geneset)
        }
      },
      { label }
    )
  }

  removeGeneSet(
    fileId: string,
    genesetId: string,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Remove geneset' } = options
    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          const index = file.genesets.findIndex(
            (geneset) => geneset.id === genesetId
          )

          if (index !== -1) {
            file.genesets.splice(index, 1)
          }
        }
      },
      { label }
    )
  }

  updateGeneSet(
    fileId: string,
    geneset: IGeneSet,
    options: HistoryOptions = {}
  ): void {
    const { label = 'Update geneset' } = options
    this.history.commit(
      (draft) => {
        const file = draft.files.find((file) => file.id === fileId)

        if (file) {
          const index = file.genesets.findIndex(
            (candidate) => candidate.id === geneset.id
          )

          if (index !== -1) {
            file.genesets[index] = geneset
          }
        }
      },
      { label }
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

export function useFilesHistory(item: FilesHistory): FilesState {
  return useSyncExternalStore(item.subscribe, () => item.value)
}

export function newFile(
  state: Omit<Partial<FileState>, 'id' | 'timestamp'>
): FileState {
  return {
    ...DEFAULT_FILE_STATE,
    ...state,
    id: makeUuid(),
    timestamp: Date.now(),
  }
}
