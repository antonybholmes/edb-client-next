import type { IMutationDataset } from '@components/pages/modules/wgs/mutations/pileup-plot-svg'

export function makeAssemblyMutationMap(
  datasets: IMutationDataset[]
): Map<string, IMutationDataset[]> {
  const ret = new Map<string, IMutationDataset[]>()

  datasets.forEach((dataset) => {
    if (!ret.has(dataset.assembly)) {
      ret.set(dataset.assembly, [])
    }

    ret.get(dataset.assembly)?.push(dataset)
  })

  return ret
}
