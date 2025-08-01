import nav from '../../../../content/help/search-index.json'

export const dynamic = 'force-static'

export async function GET() {
  return Response.json(nav)
}
