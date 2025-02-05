import { AnimatedSpinnerIcon } from '@icons/animated-spinner'

import { VCenterRow } from '../layout/v-center-row'

export function LoadingDialog() {
  return (
    <div>
      <VCenterRow className="gap-x-2">
        <AnimatedSpinnerIcon />
        Loading...
      </VCenterRow>
    </div>
  )
}
