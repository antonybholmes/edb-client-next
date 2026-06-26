import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { TEXT_SAVE_TABLE } from '@/consts'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { createGeneConvTable, Species } from '@/lib/gene/geneconv'
import { useState } from 'react'
import { useCurrentSheets } from '../../../matcalc/history/history-provider/history-contexts'

import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { useOpenFiles } from '../../../matcalc/hooks/open'

const speciesTabs = [
  { id: 'human', name: 'Human' },
  { id: 'mouse', name: 'Mouse' },
]

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()

  const { sheets } = useCurrentSheets()
  const { addSheets } = useHistory()

  const [fromSpecies, setFromSpecies] = useState<Species>('human')
  const [toSpecies, setToSpecies] = useState<Species>('mouse')
  const [exact] = useState(true)

  const { openDataFrames } = useOpenFiles()

  function save(format: string) {
    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheets[0] as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    //setShowFileMenu(false)
  }

  async function convertGenes() {
    console.log('Converting genes...', sheets[0])

    const dfa = await createGeneConvTable(sheets[0] as AnnotationDataFrame, {
      fromSpecies,
      toSpecies,
      exact,
    })

    console.log('Converted genes:', dfa)

    if (dfa) {
      addSheets([dfa], { name: `Gene Conversion` })
    }
  }

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, (files) =>
                  openDataFrames(files)
                )
              },
            })
          }}
        />

        <ToolbarIconButton
          onClick={() => {
            openDialog({
              type: 'save',
              payload: {
                callback: (data) => {
                  save(data.format.ext)
                },
              },
            })
          }}
          title={TEXT_SAVE_TABLE}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Convert">
        <ToolbarIconButton
          aria-label="Convert"
          onClick={convertGenes}
          title="Convert"
        >
          <PlayIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup className="gap-x-2 mr-1" title="From">
        <ToggleGroup
          //variant="outline"

          value={[fromSpecies]}
          onValueChange={(v) => {
            setFromSpecies(v[0]! as Species)
          }}
          size="toolbar"
          direction="toolbar"
        >
          {speciesTabs.map((tab) => (
            <GroupToggle key={tab.id} value={tab.id}>
              {tab.name}
            </GroupToggle>
          ))}
        </ToggleGroup>
      </ToolbarTabGroup>

      <ToolbarTabGroup className="gap-x-2 ml-1" title="To">
        <ToggleGroup
          value={[toSpecies]}
          onValueChange={(v) => {
            setToSpecies(v[0]! as Species)
          }}
          size="toolbar"
          direction="toolbar"
        >
          {speciesTabs.map((tab) => (
            <GroupToggle key={tab.id} value={tab.id}>
              {tab.name}
            </GroupToggle>
          ))}
        </ToggleGroup>
      </ToolbarTabGroup>
    </>
  )
}
