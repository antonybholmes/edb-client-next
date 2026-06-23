import { OPTS_SIDEBAR_ID } from '@/components/slide-bar/resizable-sidebar'
import { useSlideBar } from '@/components/slide-bar/slide-bar-store'
import { ShowOptionsMenu } from '@/components/toolbar/toolbar'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { produce } from 'immer'

export function OptsSidebarMenu({
  id = OPTS_SIDEBAR_ID,
  open = true,
  onClick,
}: {
  id?: string
  open: boolean
  onClick?: (open: boolean) => void
}) {
  const { open: slideBarOpen, setOpen } = useSlideBar(id, { defaultOpen: open })
  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()

  return (
    <ShowOptionsMenu
      show={slideBarOpen}
      onClick={() => {
        updateEdbSettings(
          produce(edbSettings, (draft) => {
            draft.sidebar.show = slideBarOpen
          })
        )

        setOpen(!slideBarOpen)
        onClick?.(!slideBarOpen)
      }}
    />
  )
}
