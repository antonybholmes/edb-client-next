import { API_XLSX_TO_JSON_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { range } from '@/lib/math/range'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { makeCell } from '@lib/dataframe/cell'
import { DataFrame } from '@lib/dataframe/dataframe'
import {
  DataFrameReader,
  type Delimiter,
} from '@lib/dataframe/dataframe-reader'
import { textToLines } from '@lib/text/lines'
import type { QueryClient } from '@tanstack/react-query'

import { useEffect, useRef, type ChangeEvent } from 'react'

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
}

export const DEFAULT_PARSE_OPTS: IParseOptions = {
  colNames: 1,
  indexCols: 1,
  skipRows: 0,
  delimiter: '\t',
  keepDefaultNA: false,
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
  let binaryString = ''
  const bytes = new Uint8Array(buffer)

  bytes.forEach((b) => (binaryString += String.fromCharCode(b)))
  return btoa(binaryString)
}

interface IProps {
  open?: string
  //onOpenChange?: (message: string) => void
  onFileChange?: (message: string, files: FileList | null) => void
  dirMode?: boolean
  multiple?: boolean
  fileTypes?: string[]
}

export function OpenFiles({
  open = 'open',
  //onOpenChange,
  onFileChange,
  dirMode = false,
  multiple = false,
  fileTypes = ['txt', 'tsv', 'vst', 'xlsx'],
}: IProps) {
  const ref = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function _onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const { files } = e.target

    onFileChange?.(open, files)

    // force clear selection so we can keep selecting file if we want.
    e.target.value = ''
  }

  useEffect(() => {
    // simulate user clicking open button whenever open changes
    ref.current?.click()

    //onOpenChange?.("")
  }, [open])

  if (dirMode) {
    return (
      <form className="hidden">
        <input
          ref={ref}
          type="file"
          id="file"
          onChange={_onFileChange}
          //multiple
          //accept={getFileTypes(fileTypes)}
        />
      </form>
    )
  } else if (multiple) {
    return (
      <form className="hidden">
        <input
          ref={ref}
          type="file"
          id="file"
          onChange={_onFileChange}
          multiple
          accept={getFileTypes(fileTypes)}
        />
      </form>
    )
  } else {
    return (
      <form className="hidden">
        <input
          ref={ref}
          type="file"
          id="file"
          onChange={_onFileChange}
          accept={getFileTypes(fileTypes)}
        />
      </form>
    )
  }
  // return (
  //   <form className="hidden">
  //     {multiple ? (
  //       <input
  //         ref={ref}
  //         type="file"
  //         id="file"
  //         onChange={_onFileChange}
  //         multiple
  //         accept={getFileTypes(fileTypes)}
  //       />
  //     ) : (
  //       <input
  //         ref={ref}
  //         type="file"
  //         id="file"
  //         onChange={_onFileChange}
  //         accept={getFileTypes(fileTypes)}
  //       />
  //     )}
  //   </form>
  // )
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    // Define error callback
    reader.onerror = (error) => reject(error)

    // Read the file as text (can be changed to readAsDataURL or others based on your needs)
    //reader.readAsText(file);

    if (file.name.includes('xlsx')) {
      reader.onload = (e) => {
        const result = e.target?.result

        if (result) {
          // since this seems to block rendering, delay by a second so that the
          // animation has time to start to indicate something is happening and
          // then finish processing the file

          const buffer: ArrayBuffer = result as ArrayBuffer

          resolve(arrayBufferToBase64(buffer))
        } else {
          reject('no data')
        }
      }

      reader.readAsArrayBuffer(file)
    } else {
      reader.onload = () => resolve(reader.result as string)

      reader.readAsText(file)
    }
  })
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

  //const file = files[0]!
  //const name = file.name

  files = [...files]

  const texts = await readFiles(files)

  const ret = files.map((file, fi) => ({
    name: file.name,
    text: texts[fi]!,
    ext: file.name.split('.').pop() || '',
  }))

  onSuccess(ret)

  // try {
  //   const fileReader = new FileReader()

  //   if (file.name.includes('xlsx')) {
  //     fileReader.onload = e => {
  //       const result = e.target?.result

  //       if (result) {
  //         // since this seems to block rendering, delay by a second so that the
  //         // animation has time to start to indicate something is happening and
  //         // then finish processing the file

  //         const buffer: ArrayBuffer = result as ArrayBuffer

  //         const text = arrayBufferToBase64(buffer)

  //         onSuccess([{ name, text, ext: name.split('.').pop() || '' }])
  //       }
  //     }

  //     fileReader.readAsArrayBuffer(file)
  //   } else {
  //     fileReader.onload = e => {
  //       const result = e.target?.result

  //       if (result) {
  //         // since this seems to block rendering, delay by a second so that the
  //         // animation has time to start to indicate something is happening and
  //         // then finish processing the file

  //         const text: string = result as string

  //         onSuccess([{ name, text, ext: name.split('.').pop() || '' }])
  //       }
  //     }

  //     fileReader.readAsText(file)
  //   }
  // } catch (err) {
  //   if (err instanceof Error) {
  //     onFailure?.(err.message, files)
  //   }
  // }
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
  onSuccess?: (tables: BaseDataFrame[]) => void
  onFailure?: (message: string, files: ITextFileOpen[]) => void
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
  queryClient: QueryClient,
  files: ITextFileOpen[],
  options: IFilesToDataFrameProps = {}
) {
  if (files.length === 0) {
    options?.onFailure?.('no files', files)
    return
  }

  const { indexCols, colNames, keepDefaultNA } = {
    ...DEFAULT_PARSE_OPTS,
    ...options?.parseOpts,
  }

  const tables: BaseDataFrame[] = []

  try {
    for (const file of files) {
      const name = file.name
      let table: BaseDataFrame | null = null

      if (file.name.includes(XLSX_EXT)) {
        const res = await queryClient.fetchQuery({
          queryKey: ['convert'],
          queryFn: () =>
            httpFetch.postJson(API_XLSX_TO_JSON_URL, {
              body: {
                b64xlsx: file.text,
                indexes: indexCols,
                headers: colNames,
              },
            }),
        })

        const t = res.data.table

        // try some type conversion on the raw data
        const data = t.data.map((row: string[]) =>
          row.map((c) => makeCell(c, keepDefaultNA))
        )

        table = new DataFrame({
          data,
          index: indexCols! > 0 ? t.index[0] : null,
          columns: colNames! > 0 ? t.columns[0] : null,
          name,
        })
      } else {
        // regular text so we can do that in browser

        const lines = textToLines(file.text)

        const sep = name.endsWith('csv') ? ',' : '\t'

        table = new DataFrameReader()
          .delimiter(sep)
          .keepDefaultNA(keepDefaultNA!)
          .colNames(colNames!)
          .indexCols(indexCols!)
          .read(lines)
          .setName(name)
      }

      const isBed = name.endsWith('bed')

      if (isBed) {
        table = table.setColNames([
          ...['chr', 'start', 'end'],
          ...range(table.shape[1] - 3).map((i) => `data ${i + 1}`),
        ])
      }

      if (table) {
        tables.push(table)
      }
    }

    options?.onSuccess?.(tables)
  } catch (err) {
    //console.log(err)

    if (err instanceof Error) {
      options?.onFailure?.(err.message, files)
    }
  }
}
