import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { truncate } from '@/lib/text/text'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'

export function useOpen() {
  const { openFile } = useHistory()

  function onFileChange(_message: string, files: FileList | []) {
    if (files.length === 0) {
      return
    }

    const file: File = files[0]! // OR const file = files.item(i);
    const name = file.name

    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      const result = e.target?.result

      if (result) {
        const text: string =
          typeof result === 'string' ? result : Buffer.from(result).toString()

        const lines = text.split(/[\r\n]+/g).filter((line) => line.length > 0)

        const retMap: { [key: string]: Set<string> } = {}
        const geneSets: string[] = lines[0]!.split('\t')

        for (const gs of lines[0]!.split('\t')) {
          retMap[gs] = new Set<string>()
        }

        for (const line of lines.slice(1)) {
          for (const [genei, gene] of line.split('\t').entries()) {
            if (gene.length > 0 && gene !== '----') {
              retMap[geneSets[genei]!]!.add(gene)
            }
          }
        }

        const table = new DataFrameReader()
          .indexCols(0)
          .ignoreRows(file.name.includes('gmx') ? [1] : [])
          .read(lines)
          .setName(file.name)

        //setDataFile(table)

        openFile(name, {
          sheets: [
            table.setName(
              truncate(name, { length: 16 })
            ) as AnnotationDataFrame,
          ],
        })
      }
    }

    fileReader.readAsText(files[0]!)
  }

  return {
    onFileChange,
  }
}
