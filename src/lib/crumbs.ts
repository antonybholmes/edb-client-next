import { fixName, type UndefStr } from '@lib/text/text'
import { capitalCase } from './text/capital-case'

const EXCLUDE = ['Tag', 'Category', 'Section', 'Page']

export type ICrumb = [string, string]

export interface ICrumbProps {
  showCrumbs?: boolean
  crumbs?: [string, string][]
}

function _formatName(name: string) {
  return fixName(capitalCase(name.replace(/^\d{4}-\d{2}-\d{2}-/, '')))
}

export function createCrumbs(url: UndefStr): ICrumb[] {
  url = url ?? '/'
  const segments = url.split('/').filter((s: string) => s.length > 0)

  const crumbs: ICrumb[] = []

  for (let i = 0; i < segments.length; ++i) {
    // strip date from slug then attempt to convert
    // to more readable form by capitalizing and
    // changing dashes to spaces.
    const name = _formatName(segments[i]!)

    const path = `/${segments.slice(0, i + 1).join('/')}`
    if (!EXCLUDE.includes(name) && name.search(/^\d+$/) === -1) {
      crumbs.push([name, path])
    }
  }

  return crumbs
}
