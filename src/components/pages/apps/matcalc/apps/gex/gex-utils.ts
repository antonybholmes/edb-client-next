import {
  AnnotationDataFrame,
  type ISharedAnnotationDataFrame,
} from '@lib/dataframe/annotation-dataframe'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import type { IGexDataset } from './gex-store'

export function metadataToFrame(selectedDataset: IGexDataset): BaseDataFrame {
  const data: string[][] = []

  for (const sample of selectedDataset.samples) {
    const row = sample.metadata.map(m => m.value.toString())

    data.push(row)
  }

  const columns = selectedDataset.samples[0]!.metadata.map(m => m.name)

  const df = new AnnotationDataFrame({
    data,
    index: selectedDataset.samples.map(sample => sample.name),
    columns,
    name: `${selectedDataset.name} metadata`,
  })

  df.setIndexName('Sample')

  return df
}

export function metadataToShared(
  selectedDataset: IGexDataset
): ISharedAnnotationDataFrame {
  const maxAltNameCount = Math.max(
    ...selectedDataset.samples.map(sample => sample.altNames.length)
  )

  let columns: string[][] = []

  for (let i = 0; i < maxAltNameCount; i++) {
    columns.push([`Alt Name ${i + 1}`])
  }

  columns = columns.concat(
    selectedDataset.samples[0]!.metadata.map(m => [m.name])
  )

  const data: string[][] = []

  for (const sample of selectedDataset.samples) {
    const row: string[] = sample.altNames.concat(
      sample.metadata.map(m => m.value.toString())
    )

    data.push(row)
  }

  return {
    colMetaData: {
      columns: ['Header'],
      data: columns,
    },
    rowMetaData: {
      columns: ['Sample'],
      data: selectedDataset.samples.map(sample => [sample.name]),
    },
    data,
    name: `${selectedDataset.name} metadata`,
  }
}
