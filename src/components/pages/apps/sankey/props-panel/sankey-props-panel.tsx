import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { LinkPropsPanel } from './link-props-panel'
import { NodePropsPanel } from './node-props-panel'
import { PlotPropsPanel } from './plot-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function SankeyPropsPanel() {
  return (
    <Tabs orientation="vertical" className="flex flex-col grow text-xs pr-1">
      <TabsContent value="plot">
        <PlotPropsPanel />
      </TabsContent>
      <TabsContent value="nodes">
        <NodePropsPanel />
      </TabsContent>
      <TabsContent value="links">
        <LinkPropsPanel />
      </TabsContent>

      <TabsList>
        <TabsTrigger value="plot" className="grow" variant="sidebar">
          Plot
        </TabsTrigger>
        <TabsTrigger value="nodes" className="grow" variant="sidebar">
          Nodes
        </TabsTrigger>
        <TabsTrigger value="links" className="grow" variant="sidebar">
          Links
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
