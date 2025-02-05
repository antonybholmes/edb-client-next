import { BaseCol } from '@/components/layout/base-col'
import { BaseDropDown } from '@components/base-dropdown'
import { CirclePlusIcon } from '@components/icons/circle-plus-icon'
import { OpenIcon } from '@components/icons/open-icon'
import { SaveIcon } from '@components/icons/save-icon'
import { TrashIcon } from '@components/icons/trash-icon'
import { onTextFileChange, OpenFiles } from '@components/pages/open-files'
import { Input } from '@components/shadcn/ui/themed/input'
import { ToolbarDropdownButton } from '@components/toolbar/toolbar-dropdown-button'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'

import { VCenterRow } from '@/components/layout/v-center-row'
//import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
//import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons"
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { type IClusterGroup } from '@lib/cluster-group'

import { H2_CLS } from '@/theme'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { downloadJson } from '@lib/download-utils'
import { nanoid } from '@lib/utils'
import { useState, type RefObject } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'

const PRESET_COLORS = ['#cd9323', '#1a53d8', '#9a2151', '#0d6416', '#8d2808']

export interface IProps {
  df: BaseDataFrame | null
  groups: IClusterGroup[]
  onGroupsChange?: (groups: IClusterGroup[]) => void
  downloadRef: RefObject<HTMLAnchorElement | null>
  onCancel?: () => void
}

export function ClustersPanel({
  df,
  groups,
  onGroupsChange,

  downloadRef,
}: IProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  const [showColor, setShowColor] = useState(false)
  //const [groups, setGroups] = useState<IGroup[]>([])

  // useEffect(() => {
  //   setGroups([])
  // }, [df])

  // function onFileChange(_message: string, files: FileList | null) {
  //   if (!files) {
  //     return
  //   }

  //   const file = files[0]!

  //   //setFile(files[0])
  //   //setShowLoadingDialog(true)

  //   const fileReader = new FileReader()

  //   fileReader.onload = e => {
  //     const result = e.target?.result

  //     if (result) {
  //       // since this seems to block rendering, delay by a second so that the
  //       // animation has time to start to indicate something is happening and
  //       // then finish processing the file
  //       const text: string =
  //         typeof result === 'string' ? result : Buffer.from(result).toString()

  //       const d = JSON.parse(text)

  //       if (Array.isArray(d)) {
  //         onGroupsChange?.(d)
  //       }
  //     }
  //   }

  //   fileReader.readAsText(file)

  //   //setShowFileMenu(false)
  // }

  function addGroup() {
    console.log(!df)
    if (!df || name === '' || search === '') {
      return
    }

    // const searchFor = search.split(",").map(x => x.trim().toLowerCase())

    // const indices: number[] = df
    //   .col("Cluster")
    //   .values.map((v, i) => [i, v.toString().toLowerCase()])
    //   .filter((c: [number, string]) => {
    //     for (const x of searchFor) {
    //       if (c[1].includes(x)) {
    //         return true
    //       }
    //     }

    //     return false
    //   })
    //   .map((c: [number, string]) => c[0])

    //if (indices.length > 0) {
    const g: IClusterGroup[] = [
      ...groups,
      { id: nanoid(), name, search: search.split(','), color },
    ]
    //setGroups(g)
    onGroupsChange?.(g)
    //}
  }

  return (
    <>
      <BaseCol className="h-full grow gap-y-2 py-4 text-xs">
        <h2 className={H2_CLS}>Clusters</h2>

        <VCenterRow className="gap-x-2">
          <ToolbarTabGroup>
            <ToolbarIconButton onClick={() => setOpen(true)}>
              <OpenIcon stroke="" />
            </ToolbarIconButton>

            <ToolbarIconButton
              onClick={() => downloadJson(groups, downloadRef, 'clusters.json')}
            >
              <SaveIcon className="rotate-180" />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToolbarIconButton
              onClick={() => addGroup()}
              content="Tooltip group"
            >
              <CirclePlusIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
        </VCenterRow>

        {/* <Tooltip content="Add group">
            <ToolbarIconButton
              variant="base-outline"
              className="rounded-full"
              onClick={() => addGroup()}
            >
              <FontAwesomeIcon icon={faPlus} />
            </ToolbarIconButton>
          </Tooltip> */}

        <BaseCol className="grow gap-y-2">
          <VCenterRow className="gap-x-2">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="Name..."
            />
            <BaseDropDown
              open={showColor}
              onOpenChange={(open) => setShowColor(open)}
            >
              <ToolbarDropdownButton
                selected={showColor}
                onClick={() => setShowColor(!showColor)}
              >
                <div
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </ToolbarDropdownButton>

              <BaseCol className="gap-y-2 p-1">
                <HexAlphaColorPicker color={color} onChange={setColor} />

                <div className="grid grid-cols-8 gap-px">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      className="trans-300 transition-color h-6 w-6 border border-transparent hover:border-white"
                      style={{ background: presetColor }}
                      onClick={() => setColor(presetColor)}
                    />
                  ))}
                </div>
              </BaseCol>
            </BaseDropDown>
          </VCenterRow>

          {/* <span>Search:</span> */}
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="col-span-3"
            placeholder="Search..."
          />

          {/* <span>Color</span> */}
        </BaseCol>

        {/* <VCenterRow>
          <ToolbarButton onClick={() => addGroup()}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Add</span>
          </ToolbarButton>
        </VCenterRow> */}

        <ul className="mt-4 flex grow flex-col gap-y-3 overflow-y-auto border-t border-border pt-4">
          {groups.map((group, gi) => (
            <li key={group.id} className="flex flex-row items-center gap-x-2">
              <BaseCol
                className="grow rounded-lg px-3 py-2 text-white shadow-md"
                style={{
                  backgroundColor: `${group.color}20`,
                  color: group.color,
                }}
              >
                <p className="font-semibold">{group.name}</p>
                {/* <p>{group.indices.length.toLocaleString()} rows.</p> */}
              </BaseCol>
              <button
                onClick={() => {
                  onGroupsChange?.([
                    ...groups.slice(0, gi),
                    ...groups.slice(gi + 1),
                  ])
                }}
                className="trans-300 px-2 text-gray-400 transition-colors hover:text-red-500"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      </BaseCol>
      {open && (
        <OpenFiles
          open="open"
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => {
              if (files.length > 0) {
                const d = JSON.parse(files[0]!.text)

                if (Array.isArray(d)) {
                  onGroupsChange?.(d)
                }
              }
            })
          }
          fileTypes={['json']}
        />
      )}
    </>
  )
}
