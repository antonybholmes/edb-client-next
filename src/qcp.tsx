'use client'

import type { IChildrenProps } from '@interfaces/children-props'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QCP({ children }: IChildrenProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
