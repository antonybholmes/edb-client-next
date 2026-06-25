import { DownloadIcon } from '@/components/icons/download-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { useContext } from 'react'

import { TEXT_FILE, TEXT_SAVE_TABLE } from '@/consts'
import { oneWayFromDataframes } from '@/lib/genomic/overlap/one-way-overlap'
import {
  createOverlapTableFromDataframes,
  OVERLAP_MODE,
} from '@/lib/genomic/overlap/overlap'
import { OverlapContext } from '../overlap-provider'
import { useSave } from '../use-save'

export function HomeToolbar() {
  const { save } = useSave()

  const { dfs, setDfs, setSelected, openOverlapFiles } =
    useContext(OverlapContext)

  function overlapGenomicLocations(mode: OVERLAP_MODE = 'mcr') {
    //const dataframes = order.map(id => dfMap.get(id)!)

    const dfOverlaps = createOverlapTableFromDataframes(dfs, mode)

    if (dfOverlaps) {
      setDfs([...dfs, dfOverlaps])
      setSelected(dfOverlaps.id)
    }
  }

  function overlapOneWay() {
    //const dataframes = order.map(id => dfMap.get(id)!)

    const dfOverlaps = oneWayFromDataframes(dfs)

    if (dfOverlaps) {
      setDfs([...dfs, dfOverlaps])
      setSelected(dfOverlaps.id)
    }
  }

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, openOverlapFiles)
              },
            })
          }}
        />

        <ToolbarIconButton onClick={() => save('txt')} title={TEXT_SAVE_TABLE}>
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Overlap">
        <ToolbarButton
          title="Calculate minimum common regions for columns of genomic coordinates"
          onClick={() => overlapGenomicLocations('mcr')}
        >
          MCR
        </ToolbarButton>
        <ToolbarButton
          aria-label="Calculate maximum overlap regions for columns of genomic coordinates"
          onClick={() => overlapGenomicLocations('max')}
        >
          Min/max
        </ToolbarButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="One Way">
        <ToolbarButton
          title="Calculate minimum common regions for columns of genomic coordinates"
          onClick={() => overlapOneWay()}
        >
          One Way
        </ToolbarButton>
      </ToolbarTabGroup>
    </>
  )
}
