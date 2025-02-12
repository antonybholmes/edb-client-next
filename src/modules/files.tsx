import { VCenterRow } from '@/components/layout/v-center-row'
import { textToLines } from '@/lib/text/lines'

import {
  DEFAULT_READER,
  DataFrameReader,
} from '@lib/dataframe/dataframe-reader'
import { LoadButton } from '@modules/load-button'
import type { IFileDispatch } from '@providers/file-reducer'
import { useRef, type ChangeEvent } from 'react'

function getFileTypes(fileTypes: string[]) {
  return fileTypes
    .sort()
    .map((t) => `.${t}`)
    .join(', ')
}

interface IProps {
  filesDispatch: IFileDispatch
  reader?: DataFrameReader
  multiple?: boolean
  fileTypes?: string[]
  isLoading?: boolean
}

export function Files({
  filesDispatch,
  reader: reader = DEFAULT_READER,
  multiple = false,
  fileTypes = ['BED', 'csv', 'txt', 'tsv'],
  //onClick,
  isLoading = false,
}: IProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    //filesDispatch({ type: "clear", files: [] })

    const { files } = e.target

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file: File = files[i]! // OR const file = files.item(i);

        const fileReader = new FileReader()

        fileReader.onload = (e) => {
          const result = e.target?.result

          if (result) {
            const text: string =
              typeof result === 'string'
                ? result
                : Buffer.from(result).toString()

            const lines = textToLines(text)
            //.slice(0, 100)

            //const locs = parseLocations(lines)

            //console.log('j')
            const f = reader.read(lines).setName(file.name)

            filesDispatch({ type: 'add', files: [f] })
          }
        }

        fileReader.readAsText(file)

        //console.log(JSON.stringify(file))
      }
    }

    // force clear selection so we can keep selecting file if we want.
    e.target.value = ''
  }

  return (
    <>
      <form>
        {multiple ? (
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            id="file"
            onChange={onFileChange}
            multiple
            accept={getFileTypes(fileTypes)}
          />
        ) : (
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            id="file"
            onChange={onFileChange}
            accept={getFileTypes(fileTypes)}
          />
        )}
      </form>

      <VCenterRow className="justify-between">
        <h2>Choose Files</h2>
        <VCenterRow className="gap-x-4">
          <LoadButton
            onClick={() => {
              console.log(inputRef.current)
              inputRef?.current?.click()
            }}
            isLoading={isLoading}
          >
            Select
          </LoadButton>
        </VCenterRow>
      </VCenterRow>

      {/* <ul className="px-4 py-8 gap-y-2 text-sm">
        {fileStore.files.map((file: IExtFile, index: number) => {
          return (
            <li
              key={index}
              className="flex flex-row justify-between items-center"
            >
              {file.name}
              <button
                onClick={() => {
                  filesDispatch({ type: "remove", files: [file] })
                }}
              >
                <CloseIcon className="w-5 h-5 fill-black" />
              </button>
            </li>
          )
        })}
      </ul> */}
    </>
  )
}
