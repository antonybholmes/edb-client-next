import { AdminUsersQueryPage } from '@/components/pages/admin/users'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Users')

export default function Page() {
  return <AdminUsersQueryPage />
}
