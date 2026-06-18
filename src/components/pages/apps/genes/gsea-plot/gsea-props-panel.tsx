import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { GeneSetsPropsPanel } from './geneset-props-panel'
import { GseaDisplayPropsPanel } from './gsea-display-props-panel'

export function GseaPropsPanel({ id }: { id: string }) {
  return (
    <Tabs orientation="vertical" className="flex flex-col grow text-xs pr-1">
      <TabsContent value="genesets">
        <GeneSetsPropsPanel />
      </TabsContent>
      <TabsContent value="display">
        <GseaDisplayPropsPanel id={id} />
      </TabsContent>
      <TabsList className="py-1">
        <TabsTrigger value="genesets" className="grow" variant="sidebar">
          Gene Sets
        </TabsTrigger>
        <TabsTrigger value="display" className="grow" variant="sidebar">
          Display
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
