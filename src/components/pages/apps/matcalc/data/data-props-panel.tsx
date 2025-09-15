import { PropsPanel } from '@components/props-panel'
import { useState } from 'react'

import { SideTabs } from '@/components/tabs/side-tabs'
import { VScrollPanel } from '@components/v-scroll-panel'
import type { IDivProps } from '@interfaces/div-props'
import { Tabs, TabsContent } from '@themed/tabs'
import { Bolt, Component } from 'lucide-react'
import { GenesetPropsPanel } from '../genesets/geneset-props-panel'
import { GroupPropsPanel } from '../groups/group-props-panel'

export interface IProps extends IDivProps {
  branchId: string
}

export function DataPropsPanel({ ref, branchId }: IProps) {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  //const [openTabs, setOpenTabs] = useState<string[]>(['groups', 'genesets'])

  const [value, setValue] = useState('groups')

  return (
    <PropsPanel ref={ref}>
      <Tabs
        defaultValue={value}
        value={value}
        onValueChange={setValue}
        className="grow flex flex-row gap-x-2"
        orientation="vertical"
      >
        {/* <HCenterRow className="py-2 text-xs">
          <IOSTabsList
            value={value}
            defaultWidth="4.5rem"
            tabs={[
              { id: 'groups', name: 'Groups' },
              { id: 'genesets', name: 'Gene Sets' },
            ]}
          />
        </HCenterRow> */}
        {/* <HCenterRow className="py-2 text-xs">
          <TabsList>
            <TabsTrigger value="groups" className="w-20">
              Groups
            </TabsTrigger>
            <TabsTrigger value="genesets" className="w-20">
              Gene sets
            </TabsTrigger>
          </TabsList>
        </HCenterRow> */}
        <TabsContent value="groups" className="flex flex-col grow">
          <VScrollPanel className="grow">
            <PropsPanel className="gap-y-2">
              <GroupPropsPanel branchId={branchId} />
            </PropsPanel>
          </VScrollPanel>
        </TabsContent>
        <TabsContent value="genesets" className="flex flex-col grow">
          <VScrollPanel className="grow">
            <PropsPanel className="gap-y-2">
              <GenesetPropsPanel branchId={branchId} />
            </PropsPanel>
          </VScrollPanel>
        </TabsContent>

        <SideTabs
          value={value}
          tabs={[
            {
              id: 'groups',
              name: 'Groups',
              icon: <Component className="w-4" />,
            },
            {
              id: 'genesets',
              name: 'Gene Sets',
              icon: <Bolt className="w-4" />,
            },
          ]}
          showLabels={false}
        />
      </Tabs>

      {/* <ScrollAccordion value={openTabs} onValueChange={setOpenTabs}>
        <AccordionItem value="groups">
          <AccordionTrigger>Groups</AccordionTrigger>
          <AccordionContent>
            <GroupPropsPanel branchId={branchId} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="genesets">
          <AccordionTrigger>Gene Sets</AccordionTrigger>
          <AccordionContent>
            <GenesetPropsPanel branchId={branchId}  />
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion> */}
    </PropsPanel>
  )
}
