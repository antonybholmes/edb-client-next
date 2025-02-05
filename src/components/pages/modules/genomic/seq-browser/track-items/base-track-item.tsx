import { VerticalGripIcon } from '@/components/icons/vertical-grip-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Checkbox } from '@/components/shadcn/ui/themed/check-box'
import { useMouseUpListener } from '@/hooks/use-mouseup-listener'
import type { IElementProps } from '@/interfaces/element-props'
import { cn } from '@/lib/class-names'
import { useContext, useState } from 'react'
import { TracksContext, type ITrackGroup } from '../tracks-provider'
import { TRACK_ITEM_CLS } from './seq-track-item'

export function BaseTrackItem({
  group,
  multiselect,
  children,
  ...props
}: IElementProps & {
  group: ITrackGroup
  multiselect: boolean
}) {
  //const controls = useDragControls()

  const [drag, setDrag] = useState(false)
  const { state, dispatch } = useContext(TracksContext)
  useMouseUpListener(() => setDrag(false))

  return (
    // <Reorder.Item
    //   id={group.id}
    //   key={group.id}
    //   value={group.id}
    //   //dragListener={false}
    //   //dragControls={controls}
    // >
    <VCenterRow
      data-drag={drag}
      className={cn(TRACK_ITEM_CLS, 'fill-foreground stroke-foreground')}
      onMouseDown={() => setDrag(true)}
      {...props}
    >
      <VCenterRow
        className="cursor-ns-resize shrink-0 pl-1"
        //onPointerDown={e => controls.start(e)}
      >
        <VerticalGripIcon />
      </VCenterRow>

      {multiselect && (
        <Checkbox
          checked={state.selected.get(group.id) ?? false}
          onCheckedChange={() => {
            dispatch({
              type: 'select',
              ids: [group.id],
              selected: !(state.selected.get(group.id) ?? false),
            })
          }}
        />
      )}

      {children}
    </VCenterRow>
    //  </Reorder.Item>
  )
}
