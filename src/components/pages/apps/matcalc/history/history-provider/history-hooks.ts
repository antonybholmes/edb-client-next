import { IClusterGroup } from '@/lib/cluster-group'
import { IGeneSet } from '@/lib/gsea/geneset'
import { useHistory } from './history-provider'
import { getFileId } from './history-selectors'
import { OptStrOrIdObj } from './history-types'

export function getGroups(file: OptStrOrIdObj = undefined): IClusterGroup[] {
  const { present, groups } = useHistory()
  const fid = getFileId(present, { file })
  return (present.groupOrder[fid] || []).map((id) => groups[id]!)
}

export function useGroupName(file: OptStrOrIdObj = undefined): string {
  const { present, groupNames } = useHistory()
  const fid = getFileId(present, { file })
  return groupNames[fid] || ''
}

export function useGenesets(file: OptStrOrIdObj = undefined): IGeneSet[] {
  const { present, genesets } = useHistory()
  const fid = getFileId(present, { file })
  return (present.genesetOrder[fid] || []).map((id) => genesets[id]!)
}
