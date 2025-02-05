import { BaseRow } from '@/components/layout/base-row'

import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { useEffect, useState, type Dispatch } from 'react'
import { LoadButton } from './load-button'

interface IProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedSamples: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedSamplesDispatch: Dispatch<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: any
}
export function SamplesList({
  selectedSamples,
  selectedSamplesDispatch,
  onClick,
}: IProps) {
  const [selectAll, setSelectAll] = useState(true)

  function setSelected(name: string, isSelected: boolean) {
    selectedSamplesDispatch({
      type: 'update-display',
      name,
      isSelected,
    })
  }

  useEffect(() => {
    selectedSamplesDispatch({
      type: 'all',
      name: '',
      isSelected: selectAll,
    })
  }, [selectAll])

  return (
    <BaseRow className="col-span-4 gap-x-2">
      <ul className="flex grow flex-col text-sm">
        {selectedSamples.items.length > 0 && (
          <li key="All">
            <Checkbox
              checked={selectAll}
              onCheckedChange={() => setSelectAll(!selectAll)}
              className="trans-200 transition-color cursor-pointer px-2 py-2 hover:bg-gray-100"
            >
              All
            </Checkbox>
          </li>
        )}

        {selectedSamples.items.map((item: string) => (
          <li
            key={item}
            onClick={() => setSelected(item, !selectedSamples.selected[item])}
            className="trans-200 transition-color cursor-pointer border-b border-gray-100 px-2 py-2 hover:bg-gray-100"
          >
            <Checkbox
              checked={selectedSamples.selected[item]}
              onCheckedChange={() =>
                setSelected(item, !selectedSamples.selected[item])
              }
            >
              {item}
            </Checkbox>
          </li>
        ))}
      </ul>
      <div>
        <LoadButton onClick={onClick}>{`Load`}</LoadButton>
      </div>
    </BaseRow>
  )
}
