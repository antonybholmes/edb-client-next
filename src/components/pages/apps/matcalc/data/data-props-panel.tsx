import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { FilterPropsPanel } from './filter-props-panel'
import { GroupingPropsPanel } from './grouping-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function DataPropsPanel() {
  return (
    <Tabs orientation="vertical" className="flex flex-col grow text-xs pr-1">
      <TabsContent value="groups">
        <GroupingPropsPanel />
      </TabsContent>
      {/* <TabsContent value="genesets">
        <GenesetPropsPanel />
      </TabsContent> */}
      <TabsContent value="filter">
        <FilterPropsPanel />
      </TabsContent>
      <TabsList className="py-1">
        <TabsTrigger value="groups" className="grow" variant="sidebar">
          Groups
        </TabsTrigger>
        {/* <TabsTrigger value="genesets" className="grow" variant="sidebar">
          Gene Sets
        </TabsTrigger> */}
        <TabsTrigger value="filter" className="grow" variant="sidebar">
          Filter
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
