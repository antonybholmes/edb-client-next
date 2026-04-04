import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'

import { ColormapPropsPanel } from './colormap-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function FeaturePropsPanel() {
  return (
    <Tabs orientation="vertical" className="flex flex-col grow text-xs pr-1">
      <TabsContent value="colormap" className="grow overflow-hidden">
        <ColormapPropsPanel />
      </TabsContent>

      <TabsList className="py-1">
        <TabsTrigger value="colormap" className="grow" variant="sidebar">
          Colormap
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
