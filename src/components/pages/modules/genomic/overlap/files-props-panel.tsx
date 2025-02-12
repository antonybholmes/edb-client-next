import { VerticalGripIcon } from '@/components/icons/vertical-grip-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { PropsPanel } from '@components/props-panel'
import { Reorder, useDragControls } from 'motion/react'
import { useContext } from 'react'
import { OverlapContext } from './overlap-provider'

function FileItem({ value, name, ...props }: { value: string; name: string }) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      {...props}
    >
      <VCenterRow className="gap-x-2 hover:bg-muted rounded-theme overflow-hidden p-1">
        <VCenterRow
          className="cursor-ns-resize shrink-0 pl-1"
          onPointerDown={(e) => controls.start(e)}
        >
          <VerticalGripIcon />
        </VCenterRow>
        <span>{name}</span>
      </VCenterRow>
    </Reorder.Item>
  )
}

export function FilesPropsPanel() {
  const { order, dfMap: dfs, setOrder } = useContext(OverlapContext)

  return (
    <>
      <PropsPanel>
        {/* <FileDropPanel
          onFileDrop={files => {
            if (files.length > 0) {
              //setDroppedFile(files[0]);
              //console.log('Dropped file:', files[0])

              onTextFileChange('Open dropped file', files, openOverlapFiles)
            }
          }}
        > */}
        <VScrollPanel>
          <Reorder.Group
            axis="y"
            values={order}
            onReorder={(newOrder) => {
              console.log(newOrder)
              setOrder(newOrder)
            }}
            className="flex flex-col"
          >
            {order.map((id) => {
              return <FileItem value={id} name={dfs.get(id)!.name} key={id} />
            })}
          </Reorder.Group>
        </VScrollPanel>
        {/* </FileDropPanel> */}
      </PropsPanel>
    </>
  )
}
