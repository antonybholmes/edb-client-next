import { BaseCol } from '@layout/base-col'

import { H2_CLS } from '@/theme'

import { VCenterRow } from '@layout/v-center-row'
import { Label } from '@themed/label'
import { RadioGroup, RadioGroupItem } from '@themed/radio-group'
import { forwardRef, type ForwardedRef } from 'react'
import type { IMutationDataset } from './pileup-plot-svg'

export interface IProps {
  databases?: IMutationDataset[]
}

export const MutationDBPanel = forwardRef(function MutationDBPanel(
  { databases }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  if (!databases) {
    return null
  }

  return (
    <BaseCol ref={ref} className="h-full grow gap-y-2 text-xs">
      <h2 className={H2_CLS}>Mutation Databases</h2>

      <RadioGroup defaultValue={databases[0]!.name} className="gap-y-2">
        {databases.map((db, dbi) => (
          <VCenterRow key={dbi} className="gap-x-1">
            <RadioGroupItem value={db.name} id={db.publicId} />
            <Label htmlFor={db.publicId}>{db.name}</Label>
          </VCenterRow>
        ))}
      </RadioGroup>
    </BaseCol>
  )
})
