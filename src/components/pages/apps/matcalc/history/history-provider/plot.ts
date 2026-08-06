import { IDBEntity } from '@/interfaces/db-entity'
import { IClusterGroupRow } from '@/lib/cluster-group'

export interface IBasePlot extends IDBEntity {
  //style: PlotStyle
  // groups to make plots so that they are independent
  // of history such that if user moves groups around
  // it won't affect any plots generated
  groupRows: IClusterGroupRow[]
  actions: string[]
  type: 'plot'
}
