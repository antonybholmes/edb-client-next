import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { onTextFileChange } from '@/components/pages/open-files'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { createDNATable, DNABase, FORMAT_TYPE } from '@/lib/genomic/dna'
import { useState } from 'react'
import { useCurrentSheets } from '../../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { useSave } from '../../../matcalc/hooks/save'

import { ISaveAsFileType } from '@/components/dialogs/save-as-dialog'
import { FILE_FORMAT_JSON } from '@/components/dialogs/save-txt-dialog'
import { Checkbox } from '@/components/shadcn/ui/themed/v1/check-box'

import { textToLines } from '@/lib/text/lines'

const FASTA_FILE_TYPE: ISaveAsFileType = {
  name: 'FASTA',
  ext: 'fasta',
}

const REV_MAP: { [K in DNABase]: DNABase } = {
  A: 'T',
  C: 'G',
  G: 'C',
  T: 'A',
  a: 't',
  c: 'g',
  g: 'c',
  t: 'a',
}

interface ISeq {
  id: string
  seq: string
}

interface IRevCompSeq extends ISeq {
  rev: string
}

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { save } = useSave()
  const { sheet } = useCurrentSheets()

  const { openFile, addSheets } = useHistory()

  const { settings } = useEdbSettings()
  //const [assembly, setAssembly] = useState('grch38')
  const [reverse, setReverse] = useState(false)
  const [complement, setComplement] = useState(false)
  const [format, setFormat] = useState<FORMAT_TYPE>('auto')
  const [mask, setMask] = useState<'' | 'lower' | 'n'>('')
  const [modeRev, setModeRev] = useState(true)
  const [modeComp, setModeComp] = useState(true)

  async function addDNA() {
    const dfa = await createDNATable(sheet as AnnotationDataFrame, {
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
    const lines = textToLines(text)

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

    console.log(revSeqs)

    setOutputSeqs(revSeqs)
  }

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onOpen={() => {
            openDialog({
              type: 'open',
              payload: {
                fileTypes: ['fasta'],
                callback: (message, files) => {
                  onTextFileChange(message, files, (files) => {
                    setText(files[0]!.text)
                  })
                },
              },
            })
          }}
          multiple={true}
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

      <ToolbarTabGroup title="Settings">
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
