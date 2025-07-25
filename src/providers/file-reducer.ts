import { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { type Dispatch } from 'react'

// export interface IExtFile {
//   name: string
//   type: string
//   file?: File
//   url?: string
// }

export interface IFileStore {
  files: BaseDataFrame[]
}

export interface IFileAction {
  type: string
  files: BaseDataFrame[]
}

export type IFileDispatch = Dispatch<IFileAction>

export function filesReducer(state: IFileStore, action: IFileAction) {
  console.log('files', action)

  switch (action.type) {
    case 'set':
      return { ...state, files: action.files }
    case 'clear':
      return { ...state, files: [] }
    case 'add':
      return { ...state, files: [...state.files, ...action.files] }
    case 'remove':
      const ret = state.files.filter(file =>
        action.files.every(af => file.name != af.name)
      )

      return { ...state, files: ret }
    default:
      return state
  }
}
