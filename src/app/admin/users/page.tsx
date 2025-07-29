import { AdminUsersPage } from '@/components/pages/admin/users-page'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Users')

export default function Page() {
  return <AdminUsersPage />
}
