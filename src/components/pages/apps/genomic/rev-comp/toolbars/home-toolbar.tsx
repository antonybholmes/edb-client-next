import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { DNABase } from '@/lib/genomic/dna'
import { useState } from 'react'
import { useSave } from '../../../matcalc/hooks/save'

import { FILE_FORMAT_JSON } from '@/components/dialogs/save-txt-dialog'
import { Checkbox } from '@/components/shadcn/ui/themed/v1/check-box'

import { textToLines } from '@/lib/text/lines'
import { produce } from 'immer'
import { FASTA_FILE_TYPE, ISeq, REV_MAP, useRevComp } from '../rev-comp-store'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { save } = useSave()

  const [modeRev, setModeRev] = useState(true)
  const [modeComp, setModeComp] = useState(true)

  const { settings, updateSettings } = useRevComp()

  function revComp(seq: ISeq): string {
    let bases: DNABase[] = seq.seq.split('') as DNABase[]

    if (modeComp) {
      bases = bases.map((c) => REV_MAP[c] ?? c)
    }

    if (modeRev) {
      bases = bases.toReversed()
    }

    return bases.join('')
  }

  function applyRevComp() {
    const lines = textToLines(settings.text)

    let name: string | null = null
    let buffer = ''
    const seqs: ISeq[] = []

    for (let line of lines) {
      line = line.trim()
      if (line.length === 0) {
        if (buffer.length > 0) {
          seqs.push({ id: name ?? `seq${seqs.length + 1}`, seq: buffer })
        }

        // space so reset
        name = null
        buffer = ''
      } else if (line.startsWith('>')) {
        if (buffer.length > 0) {
          seqs.push({ id: name ?? `seq${seqs.length + 1}`, seq: buffer })
        }

        name = line.substring(1)
      } else {
        buffer += line
      }
    }

    if (buffer.length > 0) {
      seqs.push({ id: name ?? `seq${seqs.length + 1}`, seq: buffer })
    }

    if (seqs.length === 0) {
      return
    }

    const revSeqs = seqs.map((s) => ({
      id: s.id,
      seq: s.seq,
      rev: revComp(s),
    }))

    updateSettings(
      produce(settings, (draft) => {
        draft.outputSeqs = revSeqs
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
          //multiple={true}
        />

        <ToolbarIconButton
          arial-label="Save to local file"
          onClick={() => {
            openDialog({
              type: 'save',
              payload: {
                name: 'rev-comp',
                fileTypes: [FASTA_FILE_TYPE, FILE_FORMAT_JSON],
                callback: (data) => {
                  save(data.name, data.format.ext)
                },
              },
            })
          }}
          title="Save sequences"
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Convert">
        <ToolbarButton title="Convert" onClick={applyRevComp}>
          <PlayIcon />
          <span>Convert</span>
        </ToolbarButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Settings" className="gap-x-2 items-center">
        <Checkbox
          checked={modeRev}
          onCheckedChange={(state) => setModeRev(state)}
        >
          Reverse
        </Checkbox>

        <Checkbox
          checked={modeComp}
          onCheckedChange={(state) => setModeComp(state)}
        >
          Complement
        </Checkbox>
      </ToolbarTabGroup>
    </>
  )
}
