import { useEdbSettings } from '@/components/edb/edb-settings'
import { useSlideBar } from '@/components/sidebar/slide-bar-store'
import { OPTS_SIDEBAR_ID } from '@/components/tabs/tab-provider'
import { ShowOptionsMenu } from '@/components/toolbar/toolbar'
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
