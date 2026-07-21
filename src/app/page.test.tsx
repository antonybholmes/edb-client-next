import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { ThemeProvider } from '../components/edb/theme'
import { CoreProviders } from '../providers/core-providers'
import Page from './page'

test('Page', () => {
  render(
    <ThemeProvider>
      <CoreProviders>
        <Page />
      </CoreProviders>
    </ThemeProvider>
  )
  expect(
    screen.getByRole('title', { level: 1, name: 'Home | Experiments' })
  ).toBeDefined()
})
