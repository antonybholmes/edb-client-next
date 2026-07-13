import { useDialogs } from '@/components/dialogs/dialogs'
import { ArrowLeftRightIcon } from '@/components/icons/arrow-left-right-icon'
import { ChevronRightIcon } from '@/components/icons/chevron-right-icon'
import { DownloadIcon } from '@/components/icons/download-icon'
import { ZoomInIcon } from '@/components/icons/zoom-in-icon'
import { ZoomOutIcon } from '@/components/icons/zoom-out-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { DropdownMenuCheckboxItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarDropdownButton } from '@/components/toolbar/toolbar-dropdown-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_FILE, TEXT_SAVE_IMAGE } from '@/consts'
import { newGenomicLocation } from '@/lib/genomic/genomic-location'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { ListChevronsUpDownIcon } from 'lucide-react'
import {
  GeneView,
  ReadScaleMode,
  useSeqBrowserSettings,
} from '../seq-browser-settings'
import { useTracks } from '../tracks-store'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { locations, setLocations } = useTracks()
  const { settings, updateSettings } = useSeqBrowserSettings()

  const { svgRef } = useSVG()

  function setLocationZoom(scale: number) {
    setLocations(
      locations.map((location) => {
        const w = Math.round(
          Math.max(100, (location.end - location.start + 1) * scale)
        )

        const s = Math.round((location.start + location.end) / 2 - w / 2)

        return newGenomicLocation(location.chr, s, s + w)
      })
    )
  }

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            openDialog({
              type: 'save-image',
              payload: { svgRef, name: 'tracks' },
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="View" className="gap-x-0.5">
        <ToolbarCol>
          <VCenterRow>
            <ToolbarIconButton
              title="Zoom In"
              onClick={() => setLocationZoom(0.5)}
            >
              <ZoomInIcon />
            </ToolbarIconButton>

            <ToolbarIconButton
              title="Zoom Out"
              onClick={() => setLocationZoom(2)}
            >
              <ZoomOutIcon />
            </ToolbarIconButton>
          </VCenterRow>

          <VCenterRow>
            <ToolbarIconButton
              title="Move Left"
              onClick={() => {
                setLocations(
                  locations.map((location) => {
                    const w = location.end - location.start + 1
                    const s =
                      location.start -
                      Math.pow(10, Math.max(2, Math.floor(Math.log10(w)) - 1)) *
                        2

                    return newGenomicLocation(location.chr, s, s + w)
                  })
                )
              }}
            >
              <ChevronRightIcon className="-scale-100" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Move Right"
              onClick={() => {
                setLocations(
                  locations.map((location) => {
                    const w = location.end - location.start + 1
                    const s =
                      location.start +
                      Math.pow(10, Math.max(2, Math.floor(Math.log10(w)) - 1)) *
                        2

                    return newGenomicLocation(location.chr, s, s + w)
                  })
                )
              }}
            >
              <ChevronRightIcon />
            </ToolbarIconButton>
          </VCenterRow>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Display" className="gap-x-1 items-stretch">
        <ToggleGroup
          value={[settings.tracks.genes.view]}
          onValueChange={(v) => {
            if (v[0]) {
              updateSettings(
                produce(settings, (draft) => {
                  draft.tracks.genes.view = v[0] as GeneView
                })
              )
            }
          }}
          size="toolbar"
          justify="start"
          direction="toolbar"
        >
          <GroupToggle key="transcript" value="transcript" className="px-2">
            Transcript
          </GroupToggle>

          <GroupToggle key="features" value="features" className="px-2">
            Features
          </GroupToggle>
        </ToggleGroup>

        <ToolbarCol>
          <ToolbarDropdownButton
            icon={<ListChevronsUpDownIcon size={18} strokeWidth={1.5} />}
            //icon={<span>Gene View</span>}
            title="Gene display mode"
            showArrow={false}
          >
            <DropdownMenuCheckboxItem
              checked={settings.tracks.genes.display === 'dense'}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.tracks.genes.display = 'dense'
                  })
                )
              }}
            >
              Dense
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={settings.tracks.genes.display === 'pack'}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.tracks.genes.display = 'pack'
                  })
                )
              }}
            >
              Pack
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={settings.tracks.genes.display === 'full'}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.tracks.genes.display = 'full'
                  })
                )
              }}
            >
              Full
            </DropdownMenuCheckboxItem>
          </ToolbarDropdownButton>

          <ToolbarIconButton
            title="Reverse"
            checked={settings.reverse}
            onClick={() => {
              const newOptions = produce(settings, (draft) => {
                draft.reverse = !draft.reverse
              })

              updateSettings(newOptions)
            }}
          >
            <ArrowLeftRightIcon />
          </ToolbarIconButton>
        </ToolbarCol>

        <ToggleGroup
          value={[
            settings.tracks.genes.canonical.only ? ['canonical'] : [],
            settings.tracks.genes.types === 'protein-coding'
              ? ['protein-coding']
              : [],
          ].flat()}
          onValueChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.tracks.genes.canonical.only = v.includes('canonical')

              draft.tracks.genes.types = v.includes('protein-coding')
                ? 'protein-coding'
                : 'all'
            })

            updateSettings(newSettings)
          }}
          size="toolbar"
          direction="toolbar"
          multiple={true}
        >
          <GroupToggle value="canonical" className="w-24">
            Canonical
          </GroupToggle>

          <GroupToggle value="protein-coding" className="w-24">
            Protein coding
          </GroupToggle>
        </ToggleGroup>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Scale">
        <SelectList
          variant="toolbar"
          w="xs"
          value={settings.tracks.seqs.scale.mode}
          onValueChange={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.tracks.seqs.scale.mode = v as ReadScaleMode
              })
            )
          }}
        >
          <SelectItem value="Count">Count</SelectItem>
          <SelectItem value="BPM">BPM</SelectItem>
          <SelectItem value="CPM">CPM</SelectItem>
        </SelectList>
      </ToolbarTabGroup>
    </>
  )
}
