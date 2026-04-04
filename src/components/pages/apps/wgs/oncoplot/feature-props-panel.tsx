import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { useRef } from 'react'

import { ClinicalPropsPanel } from './clinical-props-panel'
import { GenePropsPanel } from './genes-props-panel'
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
      <TabsContent value="genes" className="grow overflow-hidden">
        <GenePropsPanel />
      </TabsContent>
      <TabsContent value="variants" className="grow overflow-hidden">
        <VariantPropsPanel />
      </TabsContent>
      <TabsContent value="clinical" className="grow overflow-hidden">
        <ClinicalPropsPanel />
      </TabsContent>
      <TabsList className="py-1">
        <TabsTrigger value="genes" className="grow" variant="sidebar">
          Genes
        </TabsTrigger>
        <TabsTrigger value="variants" className="grow" variant="sidebar">
          Variants
        </TabsTrigger>

        <TabsTrigger value="clinical" className="grow" variant="sidebar">
          Clinical
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
