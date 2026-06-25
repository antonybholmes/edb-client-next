import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import {
  BaseDataFrame,
  DEFAULT_COLUMN_INDEX_NAME,
} from '@/lib/dataframe/base-dataframe'
import { makeCell } from '@/lib/dataframe/cell'
import { DataFrame } from '@/lib/dataframe/dataframe'
import {
  DataFrameReader,
  type Delimiter,
} from '@/lib/dataframe/dataframe-reader'
import { DEFAULT_INDEX_NAME } from '@/lib/dataframe/series'
import { API_XLSX_TO_JSON_URL } from '@/lib/edb/edb'
import { vfill } from '@/lib/fill'
import { httpFetch } from '@/lib/http/http-fetch'
import { range } from '@/lib/math/range'
import { textToLines } from '@/lib/text/lines'
import { Buffer } from 'buffer'

export const XLSX_EXT = 'xlsx'

export interface ITextFileOpen {
  name: string
  // Either the text of a text file, or the base64 encoded string of an xlsx file
  text: string
  ext: string
}

export interface IBinaryFileOpen {
  name: string
  // Either the text of a text file, or the base64 encoded string of an xlsx file
  data: Uint8Array
  ext: string
}

export type HumanReadableDelimiter = '<tab>' | '<comma>' | '<space>'

export function getHumanReadableDelimiter(
  file: ITextFileOpen | null
): HumanReadableDelimiter {
  if (file && file.ext === 'csv') {
    return '<comma>'
  } else {
    return '<tab>'
  }
}

export function parseHumanReadableDelimiter(
  delimiter: string
): HumanReadableDelimiter {
  if (delimiter.includes('comma') || delimiter.includes(',')) {
    return '<comma>'
  } else if (delimiter.includes('space')) {
    return '<space>'
  } else {
    return '<tab>'
  }
}

export function humanReadableDelimiterToDelimiter(
  delimiter: HumanReadableDelimiter
): Delimiter {
  switch (delimiter) {
    case '<comma>':
      return ','
    case '<space>':
      return ' '
    default:
      return '\t'
  }
}

export interface IParseOptions {
  colNames?: number
  indexCols?: number
  skipRows?: number
  delimiter?: Delimiter
  keepDefaultNA?: boolean
  trimWhitespace?: boolean
}

export const DEFAULT_PARSE_OPTS: IParseOptions = {
  colNames: 1,
  indexCols: 1,
  skipRows: 0,
  delimiter: '\t',
  keepDefaultNA: false,
  trimWhitespace: true,
}

function getFileTypes(fileTypes: string[]) {
  return fileTypes
    .sort()
    .map((t) => `.${t}`)
    .join(', ')
}

export function arrayBufferToBytes(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer)
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // let binaryString = ''
  // const bytes = new Uint8Array(buffer)

  // for (const b of bytes) {
  //   binaryString += String.fromCharCode(b)
  // }

  return Buffer.from(buffer).toString('base64') //btoa(binaryString)
}

interface IProps {
  message?: string
  //onOpenChange?: (message: string) => void
  onFileChange?: (message: string, files: FileList | []) => void
  dirMode?: boolean
  multiple?: boolean
  fileTypes?: string[] | undefined
}

export function openFilesDialog({
  message = '',
  //onOpenChange,
  onFileChange,
  dirMode = false,
  multiple = false,
  fileTypes = ['txt', 'tsv', 'vst', 'xlsx'],
}: IProps) {
  const input = document.createElement('input')

  input.type = 'file'
  input.multiple = multiple
  input.accept = !dirMode ? getFileTypes(fileTypes) : ''

  input.onchange = () => {
    onFileChange?.(message, input.files ?? [])
    input.remove()
  }

  input.oncancel = () => {
    onFileChange?.(message, [])
    input.remove()
  }

  input.click()

  // const ref = useRef<HTMLInputElement>(null)

  // // To force the file input to trigger on every click,
  // // even if the same file is selected multiple times,
  // // we append a random ID to the message.
  // // This way, the onFileChange callback will be
  // // triggered every time, and we can handle the file selection accordingly.
  // //const _message = useStableId(message)

  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // async function _onFileChange(e: ChangeEvent<HTMLInputElement>) {
  //   const { files } = e.target

  //   onFileChange?.(message, files ?? [])

  //   console.log('on file change', files)

  //   // force clear selection so we can keep selecting file if we want.
  //   e.target.value = ''
  // }

  // useEffect(() => {
  //   console.log('MOUNT', message)

  //   return () => {
  //     console.log('UNMOUNT', message)
  //   }
  // }, [])

  // useEffect(() => {
  //   // finally able to cope with user canceling file selection.
  //   // We have to listen for the cancel event on the input element
  //   // and then trigger the onFileChange callback with null files
  //   // to indicate cancellation
  //   const handleCancel = () => {
  //     console.log('File selection canceled')
  //     onFileChange?.(message, [])
  //   }

  //   ref.current?.addEventListener('cancel', handleCancel)

  //   return () => {
  //     ref.current?.removeEventListener('cancel', handleCancel)
  //   }
  // }, [message, onFileChange])

  // useEffect(() => {
  //   console.log('Triggering file input click with message:', message)
  //   // simulate user clicking open button whenever open changes
  //   ref.current?.click()
  // }, [message])

  // console.log('message xxx', message)

  // return (
  //   <input
  //     id="file-open"
  //     ref={ref}
  //     type="file"
  //     className="hidden"
  //     onChange={_onFileChange}
  //     accept={!dirMode ? getFileTypes(fileTypes) : undefined}
  //     multiple={multiple}
  //   />
  // )
}

export async function readFile(file: File): Promise<string> {
  if (file.name.includes('xlsx')) {
    return arrayBufferToBase64(await file.arrayBuffer())
  } else {
    return await file.text()
  }

  // return new Promise((resolve, reject) => {
  //   const reader = new FileReader()

  //   // Define error callback
  //   reader.onerror = (error) => reject(error)

  //   // Read the file as text (can be changed to readAsDataURL or others based on your needs)
  //   //reader.readAsText(file);

  //   if (file.name.includes('xlsx')) {
  //     reader.onload = (e) => {
  //       const result = e.target?.result

  //       if (result) {
  //         // since this seems to block rendering, delay by a second so that the
  //         // animation has time to start to indicate something is happening and
  //         // then finish processing the file

  //         const buffer: ArrayBuffer = result as ArrayBuffer

  //         resolve(arrayBufferToBase64(buffer))
  //       } else {
  //         reject('no data')
  //       }
  //     }

  //     reader.readAsArrayBuffer(file)
  //   } else {
  //     reader.onload = () => resolve(reader.result as string)

  //     reader.readAsText(file)
  //   }
  // })
}

export async function readFiles(files: FileList | File[]): Promise<string[]> {
  const fileContents = []

  // Loop through the files and read them one by one
  for (const file of files) {
    try {
      const content = await readFile(file) // Wait for each file to be read
      fileContents.push(content) // Add the content to the result array
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  return fileContents // Return an array with all file contents
}

export async function onTextFileChange(
  _message: string,
  files: File[] | FileList | null,
  onSuccess: (files: ITextFileOpen[]) => void,
  onFailure?: (message: string, files: File[] | FileList | null) => void
) {
  if (!files || files.length === 0) {
    onFailure?.('no files', files)
    return
  }

  // force into a list of files since FileList is kinda useless
  const fileList = [...files]

  const textFiles = await readFiles(fileList)

  const ret = fileList.map((file, fi) => ({
    name: file.name,
    text: textFiles[fi]!,
    ext: file.name.split('.').pop() || '',
  }))

  onSuccess(ret)
}

export function onBinaryFileChange(
  _message: string,
  files: File[] | FileList | null,
  onSuccess: (files: IBinaryFileOpen[]) => void,
  onFailure?: (message: string, files: File[] | FileList | null) => void
) {
  if (!files || files.length === 0) {
    onFailure?.('no files', files)
    return
  }

  const file = files[0]!
  const name = file.name

  try {
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      const result = e.target?.result

      if (result) {
        // since this seems to block rendering, delay by a second so that the
        // animation has time to start to indicate something is happening and
        // then finish processing the file

        const buffer: ArrayBuffer = result as ArrayBuffer

        const data = arrayBufferToBytes(buffer)

        onSuccess([{ name, data, ext: name.split('.').pop() || '' }])
      }
    }

    fileReader.readAsArrayBuffer(file)
  } catch (err) {
    if (err instanceof Error) {
      onFailure?.(err.message, files)
    }
  }
}

interface IFilesToDataFrameProps {
  parseOpts?: IParseOptions
  onSuccess?: (tables: AnnotationDataFrame[]) => void
  onError?: (message: string, files: ITextFileOpen[]) => void
}
/**
 * Convert text files to dataframes.
 *
 * @param files
 * @param options parsing options
 * @param historyDispatch push dataframes to UI history
 * @returns
 */
export async function filesToDataFrames(
  files: ITextFileOpen[],
  options: IFilesToDataFrameProps = {}
) {
  const { parseOpts, onSuccess, onError } = options

  if (files.length === 0) {
    options?.onError?.('no files', files)
    return
  }

  const {
    indexCols = 1,
    colNames = 1,
    keepDefaultNA = false,
    skipRows = 0,
    trimWhitespace = true,
  } = {
    ...parseOpts,
  }

  // colNames: 1,
  // indexCols: 1,
  // skipRows: 0,
  // delimiter: '\t',
  // keepDefaultNA: false,

  const tables: AnnotationDataFrame[] = []

  try {
    for (const file of files) {
      const name = file.name
      const isBed = name.endsWith('bed')

      let table: AnnotationDataFrame | null = null

      if (file.ext.includes(XLSX_EXT) || file.name.includes(XLSX_EXT)) {
        const res = await httpFetch.postJson<{
          data: {
            table: {
              data: string[][]
              indexNames: string[]
              index: string[][]
              columns: string[][]
            }
          }
        }>(API_XLSX_TO_JSON_URL, {
          body: {
            b64xlsx: file.text,
            indexes: indexCols,
            headers: colNames,
            skipRows,
            trimWhitespace,
          },
        })

        const t = res.data.table

        //console.log(t)

        // try some type conversion on the raw data
        const data = t.data.map((row: string[]) =>
          row.map((c) => makeCell(c, keepDefaultNA))
        )

        let rowIndex: BaseDataFrame | undefined = undefined

        if (t.index.length > 0) {
          const columns =
            t.indexNames.length > 0
              ? t.indexNames
              : range(indexCols).map((i) => `${DEFAULT_INDEX_NAME} ${i + 1}`)

          rowIndex = new DataFrame({
            data: t.index.map((row: string[]) =>
              row.map((c) => makeCell(c, keepDefaultNA))
            ),
            columns,
          })
        }

        let colIndex: BaseDataFrame | undefined = undefined

        if (t.columns.length > 0) {
          colIndex = new DataFrame({
            data: t.columns.map((col: string[]) =>
              col.map((c) => makeCell(c, keepDefaultNA))
            ),
            columns: [DEFAULT_COLUMN_INDEX_NAME],
          })
        }

        table = new AnnotationDataFrame({
          data,
          rowObs: rowIndex,
          colVars: colIndex,
          name,
        })
      } else {
        // regular text so we can parse in browser

        const lines = textToLines(file.text)

        //console.log('lines', lines, name)

        const sep = name.endsWith('csv') ? ',' : '\t'

        table = new DataFrameReader()
          .delimiter(sep)
          .keepDefaultNA(keepDefaultNA)
          .trimWhitespace(trimWhitespace)
          .colNames(isBed ? 0 : colNames)
          .indexCols(isBed ? 0 : indexCols)
          .read(lines)
          .setName(name) as AnnotationDataFrame
      }

      if (isBed) {
        table = table.setColNames([
          ...['chr', 'start', 'end'],
          //...range(table.shape[1] - 3).map(i => `data ${i + 1}`),
          ...vfill('', table.shape[1] - 3),
        ]) as AnnotationDataFrame
      }

      if (table) {
        tables.push(table)
      }
    }

    onSuccess?.(tables)
  } catch (err) {
    console.log(err)

    if (err instanceof Error) {
      onError?.(err.message, files)
    }
  }
}
