import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { useRef } from 'react'
import { GenesetPropsPanel } from '../genesets/geneset-props-panel'
import { GroupPropsPanel } from '../groups/group-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function DataPropsPanel() {
  const ref = useRef<HTMLDivElement>(null)
  //const _id = useStableId('data-props-panel')

  //const { tabIndex } = useTabs(_id)

  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  //const [openTabs, setOpenTabs] = useState<string[]>(['groups'])

  // const tabs = [
  //   {
  //     id: 'groups',
  //     name: 'Groups',
  //     content: <GroupPropsPanel />,
  //     icon: <Component className={TAB_CLS} />,
  //   },
  //   {
  //     id: 'genesets',
  //     name: 'Gene Sets',
  //     content: <GenesetPropsPanel />,
  //     icon: <Bolt className={TAB_CLS} />,
  //   },
  // ]

  // <PropsPanel className="px-1">
  {
    /* <BaseRow className="grow overflow-hidden gap-x-2">
        <VScrollPanel className="grow">
          <TabContentPanel tabIndex={tabIndex} tabs={tabs} />
        </VScrollPanel>

        <SideTabs id={_id} tabs={tabs} showLabels={false} defaultHeight={1.8} />
      </BaseRow> */
  }

  // return (
  //   <Accordion
  //     value={openTabs}
  //     onValueChange={setOpenTabs}
  //     variant="sidebar"
  //     className="mr-1 grow    border-orange-200"
  //     multiple={false}
  //     //innerCls="grow h-full border border-red-500"
  //   >
  //     <AccordionItem value="groups">
  //       <AccordionTrigger variant="sidebar">Groups</AccordionTrigger>
  //       <AccordionContent variant="sidebar" style={{ height: '100vh' }}>
  //         <GroupPropsPanel />
  //       </AccordionContent>
  //     </AccordionItem>
  //     <AccordionItem value="genesets">
  //       <AccordionTrigger variant="sidebar">Gene Sets</AccordionTrigger>
  //       <AccordionContent variant="sidebar" style={{ height: '100%' }}>
  //         <GenesetPropsPanel />
  //       </AccordionContent>
  //     </AccordionItem>
  //   </Accordion>
  // )

  // return (
  //   <OutlookAccordion
  //     id="groups"
  //     //innerCls="grow h-full border border-red-500"
  //   >
  //     <OutlookAccordionItem id="groups">
  //       <OutlookAccordionTrigger>Groups</OutlookAccordionTrigger>
  //       <OutlookAccordionContent>
  //         <GroupPropsPanel />
  //       </OutlookAccordionContent>
  //     </OutlookAccordionItem>
  //     <OutlookAccordionItem id="genesets">
  //       <OutlookAccordionTrigger>Gene Sets</OutlookAccordionTrigger>
  //       <OutlookAccordionContent>
  //         <GenesetPropsPanel />
  //       </OutlookAccordionContent>
  //     </OutlookAccordionItem>
  //   </OutlookAccordion>
  // )

  //const size = useComponentSize(ref)

  return (
    <Tabs
      ref={ref}
      orientation="vertical"
      className="flex flex-col grow text-xs pr-1"
    >
      <TabsContent value="groups" className="grow overflow-hidden">
        <GroupPropsPanel />
      </TabsContent>
      <TabsContent value="genesets" className="grow overflow-hidden">
        <GenesetPropsPanel />
      </TabsContent>
      <TabsList className="py-1 gap-y-px">
        <TabsTrigger value="groups" className="grow" variant="sidebar">
          Groups
        </TabsTrigger>
        <TabsTrigger value="genesets" className="grow" variant="sidebar">
          Gene Sets
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )

  // return (
  //   <ResizablePanelGroup
  //     orientation="vertical"
  //     className="pr-1"
  //     //autoSaveId="rev-comp-vert"
  //   >
  //     <SidebarResizablePanel
  //       id="groups"
  //       defaultSize="60%"
  //       minSize="20%"
  //       className="flex flex-col text-sm gap-y-2"
  //       title="Labels"
  //       isFirst={true}
  //     >
  //       <GroupPropsPanel />
  //     </SidebarResizablePanel>
  //     <ThinVLineHandle autoHide={false} />
  //     <SidebarResizablePanel
  //       className="flex flex-col text-sm gap-y-2"
  //       id="gene-sets"
  //       defaultSize="0%"
  //       minSize="20%"
  //       title="Gene Sets"
  //     >
  //       <GenesetPropsPanel />
  //     </SidebarResizablePanel>
  //   </ResizablePanelGroup>
  // )
}
