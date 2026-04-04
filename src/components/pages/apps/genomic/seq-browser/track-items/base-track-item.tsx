import { SortableItem } from '@/components/sortable-item'
import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import type { NullStr } from '@/lib/text/text'
import { Checkbox } from '@/themed/v2/check-box'
import { type ReactNode } from 'react'
import { type ITrackGroup } from '../tracks-provider'
import { useTracks } from '../tracks-store'

export function BaseTrackItem({
  group,
  multiselect,
  style,
  active,
  rightChildren,
  children,
  className,
  extChildren,
  ...props
}: IDivProps & {
  group: ITrackGroup
  multiselect: boolean
  active: NullStr
  rightChildren?: ReactNode
  extChildren?: ReactNode
}) {
  //const { isDragging } = useContext(SortableItemContext)

  //const [hover, setHover] = useState(false)

  // When user tabs to the item we can respond to focus
  // even though the item itself is not focusable
  //const [focus, setFocus] = useState(false)

  //const hoverMode = hover || group.id === active
  const { selectedGroups, dispatch } = useTracks()

  //const c = Children.toArray(children)

  return (
    <SortableItem
      id={group.id}
      extChildren={extChildren}
      style={style}
      dragHandle={
        multiselect ? (
          <Checkbox
            checked={selectedGroups[group.id] ?? false}
            onCheckedChange={() => {
              dispatch({
                type: 'select',
                ids: [group.id],
                selected: !(selectedGroups[group.id] ?? false),
              })
            }}
          />
        ) : undefined
      }
    >
      <VCenterRow
        className={cn(
          'group grow fill-foreground stroke-foreground gap-x-1.5',
          className
        )}
        {...props}
      >
        {/* {multiselect && (
          <Checkbox
            checked={selectedGroups[group.id] ?? false}
            onCheckedChange={() => {
              dispatch({
                type: 'select',
                ids: [group.id],
                selected: !(selectedGroups[group.id] ?? false),
              })
            }}
          />
        )} */}

        {children}
      </VCenterRow>
      {rightChildren && rightChildren}
    </SortableItem>
  )
}
