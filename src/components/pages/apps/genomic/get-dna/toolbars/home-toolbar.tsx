import { PlayIcon } from '@/components/icons/play-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { DownloadIcon } from '@/components/icons/download-icon'

import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { fetchDNA, IDNA } from '@/lib/genomic/dna'
import {
  IGenomicLocation,
  parseGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { textToLines } from '@/lib/text/lines'
import { produce } from 'immer'
import { useState } from 'react'
import { useDNA } from '../dna-store'
import { useSave } from '../use-save'

export function HomeToolbar() {
  const { settings, updateSettings } = useDNA()
  const [modeRev, setModeRev] = useState(true)
  const [modeComp, setModeComp] = useState(true)

  const { save } = useSave()

  async function getDNA() {
    const lines = textToLines(settings.text)

    const seqs: IGenomicLocation[] = []

    for (let line of lines) {
      line = line.trim()
      if (line.startsWith('>')) {
        const loc = parseGenomicLocation(line.substring(1))
        if (loc) {
          seqs.push(loc)
        }
      }
    }

    const dnaseqs: (IDNA | null)[] = await Promise.all(
      seqs.map(
        async (loc) =>
          await fetchDNA(loc, {
            reverse: modeRev,
            complement: modeComp,
          })
      )
    )

    updateSettings(
      produce(settings, (draft) => {
        draft.outputSeqs = dnaseqs.filter((x) => x !== null) as IDNA[]
      })
    )
  }

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, (files) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.text = files[0]!.text
                    })
                  )
                })
              },
            })
          }}
        />

        <ToolbarButton title="Save to local file" onClick={() => save()}>
          <DownloadIcon />
        </ToolbarButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Run">
        <ToolbarButton title="Reverse Complement" onClick={getDNA}>
          <PlayIcon />
          <span>Convert</span>
        </ToolbarButton>

        <Switch
          checked={modeRev}
          onCheckedChange={(state) => setModeRev(state)}
        >
          Reverse
        </Switch>

        <Switch
          checked={modeComp}
          onCheckedChange={(state) => setModeComp(state)}
        >
          Complement
        </Switch>
      </ToolbarTabGroup>
    </>
  )
}
