import type { IChildrenProps } from '@/interfaces/children-props'
import { LoadingSpinner } from '../alerts/loading-spinner'
import { VCenterRow } from '../layout/v-center-row'

export function RunningIndicator({
  message,
  size = 'w-4',
  children,
}: IChildrenProps & {
  message?: string | null | undefined
  size?: string
}) {
  // if message is null or undefined or empty string, show children, else show spinner with message
  if (!message) {
    return <>{children}</>
  }

  return (
    <VCenterRow className="gap-x-1.5">
      <LoadingSpinner size={size} /> {message}
    </VCenterRow>
  )
}
