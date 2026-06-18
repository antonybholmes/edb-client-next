import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { DisplayPropsPanel } from './display-props-panel'
import { MotifsPropsPanel } from './motifs-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function PropsPanel() {
  return (
    <Tabs orientation="vertical" className="flex flex-col grow text-xs pr-1">
      <TabsContent value="motifs">
        <MotifsPropsPanel />
      </TabsContent>
      <TabsContent value="display">
        <DisplayPropsPanel />
      </TabsContent>

      <TabsList className="py-1">
        <TabsTrigger value="motifs" className="grow" variant="sidebar">
          Motifs
        </TabsTrigger>
        <TabsTrigger value="display" className="grow" variant="sidebar">
          Display
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
