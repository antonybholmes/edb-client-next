import { useDialogs } from '@/components/dialogs/dialogs'
import { OptionalDropdownButton } from '@/components/toolbar/optional-dropdown-button'
import { useSeqBrowserDialogs } from './seq-browser-dialogs'
import { useTracks } from './tracks-store'

import { OpenIcon } from '@/components/icons/open-icon'
import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { makeUuid } from '@/lib/id'
import {
  Columns3,
  Dna,
  ListPlus,
  Navigation,
  Ruler,
  RulerDimensionLine,
} from 'lucide-react'
import {
  DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS,
  DEFAULT_GENE_TRACK_DISPLAY_OPTIONS,
  DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS,
  DEFAULT_RULER_TRACK_DISPLAY_OPTIONS,
  DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS,
  newTrackGroup,
  type ICytobandsTrack,
  type IGeneTrack,
  type ILocationTrack,
  type IRulerTrack,
  type IScaleTrack,
  type ITrackGroup,
} from './tracks-provider'

export function NewTrackMenu() {
  const { dispatch } = useTracks()

  const { open: openDialog } = useDialogs()
  const { open: openSeqBrowserDialog } = useSeqBrowserDialogs()

  function openTrackFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    const tracks: ITrackGroup[] = JSON.parse(file.text)

    if (Array.isArray(tracks)) {
      dispatch({ type: 'set', tracks })
    }
  }

  return (
    <OptionalDropdownButton
      icon={<ListPlus size={20} strokeWidth={1.5} />}
      title="Add Track"
      onMainClick={() =>
        openSeqBrowserDialog({
          type: 'add-seqs',
          payload: { technology: 'chip-seq' },
        })
      }
    >
      <DropdownMenuGroup>
        <DropdownMenuLabel>Samples</DropdownMenuLabel>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Signal</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                aria-label="ChIP-seq"
                onClick={() =>
                  openSeqBrowserDialog({
                    type: 'add-seqs',
                    payload: { technology: 'chip-seq' },
                  })
                }
              >
                ChIP-seq
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="RNA-seq"
                onClick={() =>
                  openSeqBrowserDialog({
                    type: 'add-seqs',
                    payload: { technology: 'rna-seq' },
                  })
                }
              >
                RNA-seq
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Cut & Run"
                onClick={() =>
                  openSeqBrowserDialog({
                    type: 'add-seqs',
                    payload: { technology: 'cut-and-run' },
                  })
                }
              >
                Cut & Run
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Peaks</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                aria-label="ChIP-seq"
                onClick={() => {
                  openSeqBrowserDialog({
                    type: 'add-peaks',
                    payload: {},
                  })
                }}
              >
                ChIP-seq
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      <MenuSeparator />
      {/* <DropdownMenuLabel>Local Files</DropdownMenuLabel> */}

      <DropdownMenuItem
        aria-label="Local Files"
        onClick={() => {
          openSeqBrowserDialog({
            type: 'add-local-files',
            payload: {},
          })
        }}
      >
        <OpenIcon stroke="" />
        <span>Files From Device</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => {
          openFilesDialog({
            fileTypes: ['json'],
            onFileChange: (message, files) =>
              onTextFileChange(message, files, (files) => {
                openTrackFiles(files)
              }),
          })
        }}
      >
        <span>Saved Tracks</span>
      </DropdownMenuItem>

      <MenuSeparator />

      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Utility</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                aria-label="Ruler"
                //className="h-14 flex-col justify-center items-center gap-2"
                onClick={() => {
                  const track: IRulerTrack = {
                    type: 'Ruler',
                    name: 'Ruler',
                    id: makeUuid(),
                    displayOptions: {
                      ...DEFAULT_RULER_TRACK_DISPLAY_OPTIONS,
                    },
                  }

                  dispatch({
                    type: 'add',
                    tracks: [newTrackGroup([track])],
                  })
                }}
              >
                <Ruler className="w-4 h-4 shrink-0" />
                <span>Ruler</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                //className="h-14 flex-col justify-center items-center gap-2"
                aria-label="Scale"
                onClick={() => {
                  const track: IScaleTrack = {
                    type: 'Scale',
                    name: 'Scale',
                    id: makeUuid(),
                    displayOptions: {
                      ...DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS,
                    },
                  }

                  dispatch({
                    type: 'add',
                    tracks: [newTrackGroup([track])],
                  })
                }}
              >
                <RulerDimensionLine className="w-4" />
                <span>Scale</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                //className="h-14 flex-col justify-center items-center gap-2"
                aria-label="Genes"
                onClick={() => {
                  const track: IGeneTrack = {
                    type: 'Gene',
                    name: 'Genes',
                    id: makeUuid(),
                    displayOptions: {
                      ...DEFAULT_GENE_TRACK_DISPLAY_OPTIONS,
                    },
                  }

                  dispatch({
                    type: 'add',
                    tracks: [newTrackGroup([track])],
                  })
                }}
              >
                <Dna className="w-4" />
                <span>Genes</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                //className="h-14 flex-col justify-center items-center gap-2"
                aria-label="Location"
                onClick={() => {
                  const track: ILocationTrack = {
                    type: 'Location',
                    name: 'Location',
                    id: makeUuid(),
                    displayOptions: {
                      ...DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS,
                    },
                  }

                  dispatch({
                    type: 'add',
                    tracks: [newTrackGroup([track])],
                  })
                }}
              >
                <Navigation className="w-4" />
                <span>Location</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                //className="h-14 flex-col justify-center items-center gap-2"
                aria-label="Cytobands track"
                onClick={() => {
                  const track: ICytobandsTrack = {
                    type: 'Cytobands',
                    name: 'Cytobands',
                    id: makeUuid(),
                    displayOptions: {
                      ...DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS,
                    },
                  }

                  dispatch({
                    type: 'add',
                    tracks: [newTrackGroup([track])],
                  })
                }}
              >
                <Columns3 className="w-4" />
                <span>Cytobands</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </OptionalDropdownButton>
  )
}
