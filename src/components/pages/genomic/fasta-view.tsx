import { Toolbar, ToolbarMenu, ToolbarPanel } from '@components/toolbar/toolbar'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'
import { ToolbarSaveSvg } from '@components/toolbar/toolbar-save-svg'

import { ModuleLayout } from '@layouts/module-layout'

import { BaseRow } from '@/components/layout/base-row'
import { HCenterCol } from '@/components/layout/h-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { SeqViewSvg } from '@/modules/fasta-view/fasta-view-svg'
import { OpenFiles } from '@components/pages/open-files'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'
import { ToolbarTabPanel } from '@components/toolbar/toolbar-tab-panel'
import { ZoomSlider } from '@components/toolbar/zoom-slider'
import { type IModuleInfo } from '@interfaces/module-info'
import { type ISeq } from '@interfaces/seq'
import { useMemo, useRef, useState } from 'react'

import { HSplitPane } from '@components/split-pane/h-split-pane'

import { type IDialogParams, NO_DIALOG } from '@/consts'
import { textToLines } from '@/lib/text/lines'
import type { ITab } from '@components/tab-provider'
import { makeRandId } from '@lib/utils'

export const MODULE_INFO: IModuleInfo = {
  name: 'FastaView',
  description: 'Display aligned FASTA',
  version: '1.0.0',
  copyright:
    'Copyright (C) ${START_YEAR:2023} Antony Holmes. All rights reserved.',
  modified: '',
}

export function SeqViewPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const [scale, setScale] = useState(3)
  const [displayProps, setDisplayProps] = useState({
    colorMode: true,
    scale: 1,
    base: { bgMode: true, bgColor: '#ddd', mismatches: true },
  })
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  // const [seqFiles, setSeqFiles] = useState<ISeq[]>([
  //   {
  //     name: "chr3:187969301-187970029",
  //     seq: "TTGCATTGGATCAGTAAAGTGGGACTAGCAGTTAAGTGTGGATACTCTCAAGCTAGCATGTCTGTTCTTTTCTGTCAATGGCTAAGTCACACTCCAATGTTACACTGCTGCTAGGCAACTCTTCTCTGCGCCCTAGACAGTGGCTTCATCTCCAGACATTGCAAGTGTCCTAGGTGAAGGTAGCTAGTACAAAGGAAAGGAGCACAGAACAAGGAGGTGAAGACCCAGTTCAAGTCCCTGGCTGCCACTTACAGGCCTATGACACTGAGAGTGGTCACATTACCTGTCAGATCTCCAGGCCCTTCTGTCCTACCAAGGGTAGATGACATCTGCCCAATAGATTATACCCAGTTCAGAAGTGATGAGGGATGTGAAAACACGTTACAAACTACACAAATGCAAGGGACTATTAGTAGAAACCCATGAATCTGATTTTGCAAGCTCAGATAAAAGGAGTCTCCCATTTAAAGATGGGCACTGGGGTATGACTTGTGGTTAGAGGCAAAATCAACGCCTGTGCCACGCAGGTGACAGAGGAGAATTTTCAGACTCTAATTTGTGCAGTCACCATGAGCTATAAGCTGGAAAATGTTTAACTGGTTCTACAGTGGTGAGAAAGCCCTGAATTATAGGTTTTGCTGATTTCTGTGGTATAAATACTTGCACCATGGCACATTCAAGCTCTCAATGTGACATCAATAACCATGGAGTGAGGAAAAGATGCCCACC",
  //   },
  //   {
  //     name: "3-187687248-187687306_A34729",
  //     seq: "---------------------------------------------------------------------------------------------------------------------------------------------------------------tgcaagtgtcctaggtgaaggtaActagtacaaaggaaaggagcacagaacaaggaggt-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------",
  //   },
  // ])

  const [seqFiles, setSeqFiles] = useState<ISeq[]>([])

  async function onFileChange(_message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const ret: ISeq[] = []

    for (let i = 0; i < files.length; i++) {
      const lines: string[] = await new Promise(resolve => {
        const file: File = files[i]! // OR const file = files.item(i);

        const fileReader = new FileReader()

        fileReader.onload = e => {
          const result = e.target?.result

          if (result) {
            const text: string =
              typeof result === 'string'
                ? result
                : Buffer.from(result).toString()

            const lines = textToLines(text)
            //.slice(0, 100)

            //const locs = parseLocations(lines)

            resolve(lines)

            // range(lines.length, 2).forEach(i =>
            //   ret.push({name:lines[i].slice(1), seq:lines[i+1]})
            // )

            // console.log(ret)
          }
        }

        fileReader.readAsText(file)
      })

      let name = ''
      let seq = ''

      lines.forEach((line, linei) => {
        if (line.startsWith('>')) {
          if (linei > 0) {
            ret.push({ name, seq })
            seq = ''
          }

          name = line.slice(1)
        } else {
          seq += line
        }
      })

      ret.push({ name, seq })
    }

    setSeqFiles(ret)
    setDisplayProps({ ...displayProps, scale: 1 })
  }

  function adjustScale(scale: number) {
    setScale(scale)
    setDisplayProps({ ...displayProps, scale })
  }

  const tabs: ITab[] = useMemo(
    () => [
      {
        //id: nanoid(),
        id: 'Home',
        content: (
          <ToolbarTabPanel>
            <HCenterCol className="gap-y-1">
              <BaseRow className="grow gap-x-1">
                <ToolbarOpenFile
                  onOpenChange={open => {
                    if (open) {
                      setShowDialog({
                        id: makeRandId('open'),
                      })
                    }
                  }}
                  multiple={true}
                />

                <ToolbarSaveSvg
                  svgRef={svgRef}
                  canvasRef={canvasRef}
                  downloadRef={downloadRef}
                />
              </BaseRow>
              {/* <span className="text-xs text-center font-semibold text-neutral-400 invisible">
                File
              </span> */}
            </HCenterCol>
            <ToolbarSeparator />
          </ToolbarTabPanel>
        ),
      },
      {
        //id: nanoid(),
        id: 'Format',
        content: (
          <ToolbarTabPanel>
            <VCenterRow className="gap-x-2">
              <Checkbox
                aria-label="Color bases"
                checked={displayProps.colorMode}
                onCheckedChange={() =>
                  setDisplayProps({
                    ...displayProps,
                    colorMode: !displayProps.colorMode,
                  })
                }
              >
                Color Bases
              </Checkbox>

              <Checkbox
                aria-label="Add background to bases"
                checked={displayProps.base.bgMode}
                onCheckedChange={() =>
                  setDisplayProps({
                    ...displayProps,
                    base: {
                      ...displayProps.base,
                      bgMode: !displayProps.base.bgMode,
                    },
                  })
                }
              >
                Background
              </Checkbox>

              <Checkbox
                aria-label="Highlight Mismatches"
                checked={displayProps.base.mismatches}
                onCheckedChange={() =>
                  setDisplayProps({
                    ...displayProps,
                    base: {
                      ...displayProps.base,
                      mismatches: !displayProps.base.mismatches,
                    },
                  })
                }
              >
                Highlight Mismatches
              </Checkbox>
            </VCenterRow>
          </ToolbarTabPanel>
        ),
      },
    ],
    [displayProps.base, displayProps.base.bgMode, displayProps.base.mismatches]
  )

  return (
    <ModuleLayout info={MODULE_INFO}>
      {/* <ToolbarTabs>
        <ToolbarTabList>
          <ToolbarTab>Home</ToolbarTab>
          <ToolbarTab>Format</ToolbarTab>
        </ToolbarTabList>
        <ToolbarTabPanels>
          <TabPanel>
            <HCenterCol className="gap-y-1">
              <BaseRow className="gap-x-1 grow">
                <ToolbarOpenFile
                  onFileChange={onFileChange}
                  multiple={true}
                  fileTypes={["fa", "fasta"]}
                />

                <ToolbarSaveSvg
                  svgRef={svgRef}
                  canvasRef={canvasRef}
                  downloadRef={downloadRef}
                />
              </BaseRow>
    
            </HCenterCol>
            <span className="border-l border-neutral-200" />
          </TabPanel>
          <TabPanel>
            <Checkbox
              ariaLabel="Color bases"
              isSelected={displayProps.colorMode}
              onCheckClick={() =>
                setDisplayProps({
                  ...displayProps,
                  colorMode: !displayProps.colorMode,
                })
              }
            >
              Color Bases
            </Checkbox>

            <Checkbox
              ariaLabel="Add background to bases"
              isSelected={displayProps.base.bgMode}
              onCheckClick={() =>
                setDisplayProps({
                  ...displayProps,
                  base: {
                    ...displayProps.base,
                    bgMode: !displayProps.base.bgMode,
                  },
                })
              }
            >
              Background
            </Checkbox>

            <Checkbox
              ariaLabel="Highlight Mismatches"
              isSelected={displayProps.base.mismatches}
              onCheckClick={() =>
                setDisplayProps({
                  ...displayProps,
                  base: {
                    ...displayProps.base,
                    mismatches: !displayProps.base.mismatches,
                  },
                })
              }
            >
              Highlight Mismatches
            </Checkbox>

         
          </TabPanel>
        </ToolbarTabPanels>
      </ToolbarTabs> */}

      <Toolbar tabs={tabs}>
        <ToolbarMenu open={showFileMenu} onOpenChange={setShowFileMenu} />
        <ToolbarPanel />
      </Toolbar>

      <HSplitPane
        panels={[
          <SeqViewSvg
            key="seq-view"
            ref={svgRef}
            seqFiles={seqFiles}
            onFileChange={onFileChange}
            displayProps={displayProps}
            className="custom-scrollbar rounded-lg border border-neutral-200"
          />,
          <></>,
        ]}
      />

      <ToolbarFooter>
        <></>
        <></>
        <VCenterRow className="gap-x-1">
          <ZoomSlider scale={scale} onZoomChange={adjustScale} />
        </VCenterRow>
      </ToolbarFooter>

      {showDialog.id.includes('open') && (
        <OpenFiles open={showDialog.id} onFileChange={onFileChange} />
      )}

      <a ref={downloadRef} className="hidden" href="#" />

      <canvas ref={canvasRef} width={0} height={0} className="hidden" />
    </ModuleLayout>
  )
}
