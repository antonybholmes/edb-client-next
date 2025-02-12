'use client'

import {
  API_ADMIN_ADD_USER_URL,
  API_ADMIN_DELETE_USER_URL,
  API_ADMIN_ROLES_URL,
  API_ADMIN_UPDATE_USER_URL,
  API_ADMIN_USER_STATS_URL,
  API_ADMIN_USERS_URL,
  DEFAULT_EDB_USER,
  type IEdbUser,
  type IRole,
} from '@/lib/edb/edb'

import { useContext, useEffect, useState } from 'react'

import { RolesLayout } from '@layouts/roles-layout'

import axios from 'axios'

import { VCenterRow } from '@/components/layout/v-center-row'
import { NO_DIALOG, TEXT_NEW, TEXT_OK, type IDialogParams } from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { PenIcon } from '@components/icons/pen-icon'
import { PlusIcon } from '@components/icons/plus-icon'
import { TrashIcon } from '@components/icons/trash-icon'
import { PaginationComponent } from '@components/pagination-component'
import { Button } from '@components/shadcn/ui/themed/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/shadcn/ui/themed/table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'

import { CenterRow } from '@/components/layout/center-row'

import { BaseCol } from '@/components/layout/base-col'
import { HCenterRow } from '@/components/layout/h-center-row'
import { useToast } from '@/hooks/use-toast'
import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { CoreProviders } from '@providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'
import { EditUserDialog, type INewUser } from './edit-user-dialog'

interface IUserStats {
  users: number
}

function AdminUsersPage() {
  const queryClient = useQueryClient()

  const [userStats, setUserStats] = useState<IUserStats | null>(null)

  const [roles, setRoles] = useState<IRole[]>([])

  const [page, setPage] = useState(1)

  const { toast } = useToast()

  const [itemsPerPage] = useState(100)

  const [users, setUsers] = useState<IEdbUser[]>([])

  const { getAccessTokenAutoRefresh } = useContext(EdbAuthContext)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  async function loadRoles() {
    const token = await getAccessTokenAutoRefresh()

    if (!token) {
      return
    }

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['admin_roles'],
        queryFn: () => {
          return httpFetch.getJson<{ data: IRole[] }>(API_ADMIN_ROLES_URL, {
            headers: bearerHeaders(token),
          })
        },
      })

      //console.log('roles', res.data)
      setRoles(res.data)
    } catch {
      console.error('could not fetch remote roles')
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  async function loadUserStats() {
    const accessToken = await getAccessTokenAutoRefresh()

    if (!accessToken) {
      return
    }

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['user_stats'],
        queryFn: () => {
          return httpFetch.getJson<{ data: IUserStats }>(
            API_ADMIN_USER_STATS_URL,
            {
              headers: bearerHeaders(accessToken),
            }
          )
        },
      })

      const stats: IUserStats = res.data

      setUserStats(stats)
    } catch (err) {
      console.error('could not load user stats')
    }
  }

  useEffect(() => {
    if (roles.length > 0) {
      loadUserStats()
    }
  }, [roles])

  async function loadUsers() {
    const accessToken = await getAccessTokenAutoRefresh()

    if (!accessToken) {
      return
    }

    console.log(accessToken)

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['users'],
        queryFn: () => {
          return httpFetch.postJson<{ data: IEdbUser[] }>(API_ADMIN_USERS_URL, {
            body: { offset: (page - 1) * itemsPerPage, records: itemsPerPage },
            headers: bearerHeaders(accessToken),
          })
        },
      })

      setUsers(res.data)
    } catch {
      console.error('could not load users from remote')
    }
  }

  useEffect(() => {
    if (userStats) {
      loadUsers()
    }

    // reset offset if number of records changes significantly
    // and we are no longer on a valid page
    //if (userStats.users < (page - 1) * itemsPerPage) {
    ///  setPage(1)
    //}
  }, [page, itemsPerPage, userStats])

  //const form = useForm<IUserAdminView>({
  // defaultValues: {
  //   // username: account.username,
  //   // email: account.email,
  //   // firstName: account.firstName,
  //   // lastName: account.lastName,
  //   // uuid: account.uuid,
  //   // roles: account.roles.join(", "),
  //   ...user,
  // },
  //})

  // useEffect(() => {
  //   if (!user) {
  //     return
  //   }

  //   form.reset({
  //     ...user,
  //   })
  // }, [user])

  const columnHelper = createColumnHelper<IEdbUser>()

  const columns: ColumnDef<IEdbUser>[] = [
    // @ts-ignore
    columnHelper.accessor('uuid', {
      header: 'Uuid',
    }),
    // @ts-ignore
    columnHelper.accessor('username', {
      header: 'Username',
    }),
    // @ts-ignore
    columnHelper.accessor('email', {
      header: 'Email',
    }),
    // @ts-ignore
    columnHelper.accessor('firstName', {
      header: 'First Name',
    }),
    // @ts-ignore
    columnHelper.accessor('lastName', {
      header: 'Last Name',
    }),
    // @ts-ignore
    columnHelper.accessor('roles', {
      header: 'Roles',
      cell: (props) => <span>{props.getValue().join(', ')}</span>,
    }),

    // @ts-ignore
    columnHelper.accessor((row) => row, {
      id: 'edit',
      header: '',
      cell: (props) => (
        <VCenterRow className="gap-x-3 justify-end">
          <button
            title="Edit user"
            onClick={() => {
              //setUser(props.getValue())

              setShowDialog({
                id: 'edit',
                params: { title: 'Edit User', user: props.getValue() },
              })
            }}
            className="group"
          >
            <PenIcon
              fill="fill-foreground/25"
              className="trans-color group-hover:fill-theme"
            />
          </button>

          <button
            title="Delete user"
            onClick={() => {
              setShowDialog({
                id: 'delete',
                params: { user: props.getValue() },
              })
            }}
            className="group"
          >
            <TrashIcon
              fill="stroke-foreground/25"
              className="trans-color group-hover:stroke-red-500"
            />
          </button>
        </VCenterRow>
      ),
    }),
  ]

  const table = useReactTable({
    // @ts-ignore
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
  })

  async function newUser(user: INewUser) {
    const accessToken = await getAccessTokenAutoRefresh()

    if (!accessToken) {
      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ['new_user'],
        queryFn: () => {
          return axios.post(
            API_ADMIN_ADD_USER_URL,
            { ...user },
            {
              headers: bearerHeaders(accessToken),
            }
          )
        },
      })

      // force refresh
      await loadUsers()
    } catch {
      console.error('error making new user')
    }
  }

  async function updateUser(user: INewUser) {
    const accessToken = await getAccessTokenAutoRefresh()

    if (!accessToken) {
      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ['update_user'],
        queryFn: () => {
          return axios.post(
            API_ADMIN_UPDATE_USER_URL, ///${user.uuid}`,
            { ...user },
            {
              headers: bearerHeaders(accessToken),
            }
          )
        },
      })

      await loadUsers()

      toast({
        title: 'User updated',
      })
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteUser(user: IEdbUser) {
    const accessToken = await getAccessTokenAutoRefresh()

    if (!accessToken) {
      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ['delete_user'],
        queryFn: () => {
          return httpFetch.delete(`${API_ADMIN_DELETE_USER_URL}/${user.uuid}`, {
            headers: bearerHeaders(accessToken),
          })
        },
      })

      await loadUsers()
    } catch (err) {
      console.error(err)
    }
  }

  // doesn't seem to like it when there is no data in the table
  // so only render table when we've loaded something. This is
  // similar to using an isMounted flag except we can use an
  // existing variable to do the same thing without an extra
  // useState
  if (users.length === 0) {
    return null
  }

  return (
    <>
      {showDialog.id === 'delete' && (
        <OKCancelDialog
          onReponse={(r) => {
            if (r === TEXT_OK) {
              deleteUser(showDialog.params!.user as IEdbUser)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          {`Are you sure you want to delete user ${
            (showDialog.params!.user as IEdbUser).uuid
          }?`}
        </OKCancelDialog>
      )}

      {showDialog.id === 'new' && (
        <EditUserDialog
          title={showDialog.params!.title as string}
          user={showDialog.params!.user as INewUser}
          setUser={(user: INewUser | undefined, _response: string) => {
            console.log('new', user)

            if (user) {
              newUser(user)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
          roles={roles}
        />
      )}

      {showDialog.id === 'edit' && (
        <EditUserDialog
          user={showDialog.params!.user as INewUser}
          setUser={(user: INewUser | undefined) => {
            if (user) {
              console.log('update', user)
              updateUser(user)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
          roles={roles}
        />
      )}

      <RolesLayout title="Users">
        <HCenterRow className="py-8">
          <BaseCol className="w-9/10 lg:w-3/4">
            <CenterRow>
              <CenterRow className="col-span-2">
                <PaginationComponent
                  currentPage={page}
                  setCurrentPage={(page) => {
                    setPage(page)
                  }}
                  itemsPerPage={itemsPerPage}
                  itemCount={users.length}
                />
              </CenterRow>
            </CenterRow>

            <BaseCol className="flex flex-col gap-y-4">
              <VCenterRow>
                <Button
                  variant="theme"
                  multiProps="lg"
                  onClick={() => {
                    setShowDialog({
                      id: 'new',
                      params: {
                        title: 'New User',
                        user: { ...DEFAULT_EDB_USER },
                      },
                    })
                  }}
                >
                  <PlusIcon stroke="stroke-white" /> {TEXT_NEW}
                </Button>
              </VCenterRow>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => {
                    return (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </BaseCol>
          </BaseCol>
        </HCenterRow>
      </RolesLayout>
    </>
  )
}

export function AdminUsersQueryPage() {
  return (
    <CoreProviders>
      <AdminUsersPage />
    </CoreProviders>
  )
}
