import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_FILE, TEXT_RUN, TEXT_SAVE_TABLE } from '@/consts'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { createDNATable, FORMAT_TYPE } from '@/lib/genomic/dna'
import { useState } from 'react'
import { useCurrentSheets } from '../../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { useSave } from '../../../matcalc/hooks/save'
import { useOpen } from '../use-open'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { save } = useSave()
  const { sheets } = useCurrentSheets()

  const { addSheets } = useHistory()

  const { settings } = useEdbSettings()

  const [reverse, setReverse] = useState(false)
  const [complement, setComplement] = useState(false)
  const [format, setFormat] = useState<FORMAT_TYPE>('auto')
  const [mask, setMask] = useState<'' | 'lower' | 'n'>('')

  const { openFiles } = useOpen()

  async function addDNA() {
    const dfa = await createDNATable(sheets[0] as AnnotationDataFrame, {
      assembly: settings.genomic.assembly,
      format,
      mask,
      reverse,
      complement,
    })

    if (dfa) {
      addSheets([dfa], { name: `DNA` })
    }
  }

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, openFiles)
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_TABLE}
          onClick={() =>
            openDialog({
              type: 'save',
              payload: {
                callback: (data) => {
                  save(data.name, data.format!.ext! as string)
                },
              },
            })
          }
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title={TEXT_RUN}>
        <ToolbarButton title="Add DNA" onClick={addDNA}>
          <PlayIcon />
          <span>Add DNA</span>
        </ToolbarButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Letters">
        <ToggleGroup
          //direction="toolbar"
          className="overflow-hidden rounded-theme"
          //rounded="none"
          size="toolbar"
          value={[format]}
          onValueChange={(v) => {
            setFormat(v[0] as FORMAT_TYPE)
          }}
        >
          <GroupToggle value="auto" className="px-2">
            Auto
          </GroupToggle>

          <GroupToggle value="upper" className="px-2">
            Upper
          </GroupToggle>

          <GroupToggle value="lower" className="px-2">
            Lower
          </GroupToggle>
        </ToggleGroup>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Options" className="gap-x-2">
        <ToolbarCol className="h-full gap-x-2">
          <Checkbox
            checked={mask === 'n'}
            onCheckedChange={() => {
              if (mask != 'n') {
                setMask('n')
              } else {
                setMask('')
              }
            }}
          >
            N
          </Checkbox>

          <Checkbox
            checked={mask === 'lower'}
            onCheckedChange={() => {
              if (mask != 'lower') {
                setMask('lower')
              } else {
                setMask('')
              }
            }}
          >
            Lowercase
          </Checkbox>
        </ToolbarCol>

        <ToolbarCol className="h-full gap-x-2">
          <Checkbox
            checked={reverse}
            onCheckedChange={() => setReverse(!reverse)}
          >
            <span>Reverse</span>
          </Checkbox>
          <Checkbox
            checked={complement}
            onCheckedChange={() => setComplement(!complement)}
          >
            <span>Complement</span>
          </Checkbox>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
