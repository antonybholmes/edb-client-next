import { PropsPanel } from '@/components/props-panel'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import { useLollipopStore } from './lollipop-store'

export function DatasetsPropsPanel({ ref }: IDivProps) {
  const {
    datasets,
    datasetsForUse,

    setDatasetsForUse,
  } = useLollipopStore()

  return (
    <PropsPanel ref={ref} className="gap-y-2 text-xs">
      <h3 className="font-semibold">Datasets</h3>
      <ul className="flex flex-col gap-y-1">
        {datasets.map((db, di) => {
          return (
            <li key={di}>
              <CheckPropRow
                title={db}
                checked={datasetsForUse[db] ?? false}
                onCheckedChange={(v) =>
                  setDatasetsForUse({
                    ...datasetsForUse,
                    [db]: v,
                  })
                }
              />
            </li>
          )
        })}
      </ul>
    </PropsPanel>
  )
}
