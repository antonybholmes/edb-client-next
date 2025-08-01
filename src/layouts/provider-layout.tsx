import { IChildrenProps } from '@/interfaces/children-props'
import { CoreProviders } from '@/providers/core-providers'

export function ProviderLayout({ children }: IChildrenProps) {
  return <CoreProviders>{children}</CoreProviders>
}
