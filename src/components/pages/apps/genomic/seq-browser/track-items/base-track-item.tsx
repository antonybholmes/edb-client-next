import { DragHandle, SortableItemContext } from '@components/sortable-item'
import type { IDivProps } from '@interfaces/div-props'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import type { NullStr } from '@lib/text/text'
import { Checkbox } from '@themed/check-box'
import { useContext, useState, type ReactNode } from 'react'
import { GROUP_BG_CLS } from '../../../matcalc/groups/group-props-panel'
import { TracksContext, type ITrackGroup } from '../tracks-provider'
import { TRACK_ITEM_CLS } from './seq-track-item'

export function BaseTrackItem({
  group,
  multiselect,
  style,
  active,
  rightChildren,
  children,
  className,
  ...props
}: IDivProps & {
  group: ITrackGroup
  multiselect: boolean
  active: NullStr
  rightChildren?: ReactNode
}) {
  const { isDragging } = useContext(SortableItemContext)

  const [hover, setHover] = useState(false)

  const hoverMode = hover || isDragging || group.id === active
  const { state, dispatch } = useContext(TracksContext)

  //const c = Children.toArray(children)

  return (
    <VCenterRow
      className={GROUP_BG_CLS}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <VCenterRow
        data-hover={hoverMode}
        className={cn(
          TRACK_ITEM_CLS,
          'fill-foreground stroke-foreground',
          className
        )}
        {...props}
      >
        <DragHandle />

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
      {rightChildren && rightChildren}
    </VCenterRow>
  )
}
