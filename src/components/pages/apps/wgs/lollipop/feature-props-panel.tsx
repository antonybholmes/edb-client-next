import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { useRef } from 'react'
import { DomainPropsPanel } from './domain-props-panel'
import { LabelPropsPanel } from './label-props-panel'
import { VariantPropsPanel } from './variant-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function FeaturePropsPanel() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <Tabs
      ref={ref}
      orientation="vertical"
      className="flex flex-col grow text-xs pr-1"
    >
      <TabsContent value="domains">
        <DomainPropsPanel />
      </TabsContent>
      <TabsContent value="variants">
        <VariantPropsPanel />
      </TabsContent>
      <TabsContent value="labels">
        <LabelPropsPanel />
      </TabsContent>
      <TabsList className="py-1">
        <TabsTrigger value="domains" className="grow" variant="sidebar">
          Domains
        </TabsTrigger>
        <TabsTrigger value="variants" className="grow" variant="sidebar">
          Variants
        </TabsTrigger>

        <TabsTrigger value="labels" className="grow" variant="sidebar">
          Labels
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
