import MODULE_INFO from '@components/pages/modules/oncoplot/module.json'
import { OncoplotQueryPage } from '@components/pages/modules/oncoplot/oncoplot'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <OncoplotQueryPage />
}
