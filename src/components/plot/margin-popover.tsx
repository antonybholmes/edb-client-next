import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { NumericalPropRow } from '@/dialogs/numerical-prop-row'

import { produce } from 'immer'
import { MarginIcon } from '../icons/margin-icon'
import { useGseaSettings } from '../pages/apps/genes/gsea-plot/gsea-settings-store'

export function MarginPopover() {
  const { settings, updateSettings } = useGseaSettings()

  //const title = `Top:${settings.plot.margin.top}, Left:${settings.plot.margin.left}, Bottom:${settings.plot.margin.bottom}, Right:${settings.plot.margin.right}`

  return (
    <Popover>
      <PopoverTrigger
        title="Margins"
        aria-label="Margins"
        w="none"
        className="opacity-50 hover:opacity-100 data-popup-open:opacity-100 transition-opacity text-xs"
        // render={
        //   <div className="grid grid-cols-[auto_1fr_auto] gap-x-1 items-center justify-center">
        //     <span></span>
        //     <span className="text-center hover:font-bold">
        //       {settings.plot.margin.top}
        //     </span>
        //     <span></span>
        //     <span className="text-right hover:font-bold">
        //       {settings.plot.margin.left}
        //     </span>
        //     <span className="w-7 bg-background h-4 border border-border/50"></span>
        //     <span className="text-left hover:font-bold">
        //       {settings.plot.margin.right}
        //     </span>
        //     <span></span>
        //     <span className="text-center hover:font-bold">
        //       {settings.plot.margin.bottom}
        //     </span>
        //     <span></span>
        //   </div>
        // }
      >
        {/* {settings.plot.margin.top}&nbsp;|&nbsp;{settings.plot.margin.left}
        &nbsp;|&nbsp;{settings.plot.margin.bottom}&nbsp;|&nbsp;
        {settings.plot.margin.right} */}
        <MarginIcon />
      </PopoverTrigger>

      <PopoverContent
        //alignOffset={4}
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
        className="gap-y-1 flex-col w-36"
        variant="content"
      >
        <NumericalPropRow
          title="Top"
          value={settings.plot.margin.top}
          onNumChanged={v =>
            updateSettings(
              produce(settings, draft => {
                draft.plot.margin.top = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Left"
          value={settings.plot.margin.left}
          onNumChanged={v =>
            updateSettings(
              produce(settings, draft => {
                draft.plot.margin.left = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Bottom"
          value={settings.plot.margin.bottom}
          onNumChanged={v =>
            updateSettings(
              produce(settings, draft => {
                draft.plot.margin.bottom = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Right"
          value={settings.plot.margin.right}
          onNumChanged={v =>
            updateSettings(
              produce(settings, draft => {
                draft.plot.margin.right = v
              })
            )
          }
        />
      </PopoverContent>
    </Popover>
  )
}
