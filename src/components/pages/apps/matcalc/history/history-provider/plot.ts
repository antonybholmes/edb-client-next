import { Axis } from '@/components/plot/axes/axis'
import { IDBEntity } from '@/interfaces/db-entity'
import { IClusterGroupRow } from '@/lib/cluster-group'

export interface IBasePlot extends IDBEntity {
  //style: PlotStyle
  // groups to make plots so that they are independent
  // of history such that if user moves groups around
  // it won't affect any plots generated
  axes?: {
    x?: Axis | undefined
    y?: Axis | undefined
    colorbar?: Axis | undefined
  }
  groupRows?: IClusterGroupRow[] | undefined
  actions?: string[] | undefined
  type: 'plot'
}
