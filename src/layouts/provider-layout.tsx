import { type IChildrenProps } from '@/interfaces/children-props'
import { CoreProviders } from '@/providers/core-provider'

export function ProviderLayout({ children }: IChildrenProps) {
  return <CoreProviders>{children}</CoreProviders>
}
