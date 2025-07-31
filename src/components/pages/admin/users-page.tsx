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
} from '@lib/edb/edb'

import { useEffect, useState } from 'react'

import { RolesLayout } from '@layouts/roles-layout'

import { NO_DIALOG, TEXT_OK, type IDialogParams } from '@/consts'
import { PaginationComponent } from '@components/pagination-component'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { PenIcon } from '@icons/pen-icon'
import { PlusIcon } from '@icons/plus-icon'
import { TrashIcon } from '@icons/trash-icon'
import { VCenterRow } from '@layout/v-center-row'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@themed/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@themed/table'

import { CenterRow } from '@layout/center-row'

import { BaseCol } from '@layout/base-col'
import { HCenterRow } from '@layout/h-center-row'
import { Card } from '@themed/card'

import { logger } from '@/lib/logger'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { httpFetch } from '@lib/http/http-fetch'
import { csfrWithTokenHeaders } from '@lib/http/urls'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@themed/crisp'
import { EditUserDialog, type INewUser } from './edit-user-dialog'

interface IUserStats {
  users: number
}

export function AdminUsersPage() {
  const queryClient = useQueryClient()

  const [userStats, setUserStats] = useState<IUserStats | null>(null)

  const [roles, setRoles] = useState<IRole[]>([])

  const [page, setPage] = useState(1)

  const [itemsPerPage] = useState(100)

  const [users, setUsers] = useState<IEdbUser[]>([])

  const { csrfToken, fetchAccessToken } = useEdbAuth()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  useEffect(() => {
    async function loadUserStats() {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return
      }

      const res = await queryClient.fetchQuery({
        queryKey: ['user_stats'],
        queryFn: () => {
          return httpFetch.getJson<{ data: IUserStats }>(
            API_ADMIN_USER_STATS_URL,
            {
              headers: csfrWithTokenHeaders(csrfToken, accessToken),
            }
          )
        },
      })

      const stats: IUserStats = res.data

      setUserStats(stats)
    }

    async function loadRoles(csrfToken: string) {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return
      }

      const res = await queryClient.fetchQuery({
        queryKey: ['admin_roles'],
        queryFn: () => {
          return httpFetch.getJson<{ data: IRole[] }>(API_ADMIN_ROLES_URL, {
            headers: csfrWithTokenHeaders(csrfToken, accessToken),
          })
        },
      })

      //console.log('roles', res.data)
      setRoles(res.data)
      loadUserStats()
    }

    if (csrfToken) {
      try {
        loadRoles(csrfToken)
      } catch {
        logger.error('could not fetch remote roles')
      }
    }
  }, [csrfToken])

  async function loadUsers() {
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    console.log(accessToken)

    const res = await queryClient.fetchQuery({
      queryKey: ['users'],
      queryFn: () => {
        return httpFetch.postJson<{ data: IEdbUser[] }>(API_ADMIN_USERS_URL, {
          body: { offset: (page - 1) * itemsPerPage, records: itemsPerPage },
          headers: csfrWithTokenHeaders(csrfToken, accessToken),
        })
      },
    })

    setUsers(res.data)
  }

  useEffect(() => {
    if (userStats) {
      try {
        loadUsers()
      } catch {
        console.error('could not load users')
      }
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

  const columns = [
    columnHelper.accessor('publicId', {
      header: 'Id',
    }),

    columnHelper.accessor('username', {
      header: 'Username',
    }),

    columnHelper.accessor('email', {
      header: 'Email',
    }),

    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      header: 'Name',
    }),

    columnHelper.accessor('roles', {
      header: 'Roles',
      cell: (props) => (
        <VCenterRow className="gap-x-0.5 text-xs font-bold text-white">
          {props.getValue().map((role) => (
            <span
              key={role}
              className="bg-theme/75 hover:bg-theme trans-color rounded-full px-2 py-0.75"
            >
              {role}
            </span>
          ))}
        </VCenterRow>
      ),
    }),

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
              className="group-hover:fill-foreground"
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
              stroke="stroke-foreground/25"
              className="group-hover:stroke-red-500"
            />
          </button>
        </VCenterRow>
      ),
    }),
  ]

  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
  })

  const smallColumns = [
    columnHelper.accessor((row) => row, {
      header: 'User Info',
      cell: (props) => (
        <BaseCol className="gap-y-3 text-sm">
          <span className=" font-bold">{props.getValue().publicId}</span>
          <span>{props.getValue().username}</span>
          <span>{props.getValue().email}</span>
          <span>
            {props.getValue().firstName} {props.getValue().lastName}
          </span>
          <VCenterRow className="gap-x-1 text-xs font-bold">
            {props.getValue().roles.map((role) => (
              <span
                key={role}
                className="bg-theme/75 hover:bg-theme trans-color rounded-full px-2 py-0.75"
              >
                {role}
              </span>
            ))}
          </VCenterRow>
        </BaseCol>
      ),
    }),

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
              className="group-hover:fill-foreground"
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
              stroke="stroke-foreground/25"
              className="group-hover:stroke-red-500"
            />
          </button>
        </VCenterRow>
      ),
    }),
  ]

  const smallTable = useReactTable({
    columns: smallColumns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
  })

  async function newUser(user: INewUser) {
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ['new_user'],
        queryFn: () => {
          return httpFetch.post(API_ADMIN_ADD_USER_URL, {
            body: { ...user },
            headers: csfrWithTokenHeaders(csrfToken, accessToken),
          })
        },
      })

      // force refresh
      await loadUsers()
    } catch {
      console.error('error making new user')
    }
  }

  async function updateUser(user: INewUser) {
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    console.log(user)

    try {
      await queryClient.fetchQuery({
        queryKey: ['update_user'],
        queryFn: () => {
          return httpFetch.post(
            API_ADMIN_UPDATE_USER_URL, ///${user.uuid}`,
            {
              body: { ...user },
              headers: csfrWithTokenHeaders(csrfToken, accessToken),
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
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ['delete_user'],
        queryFn: () => {
          return httpFetch.delete(
            `${API_ADMIN_DELETE_USER_URL}/${user.publicId}`,
            {
              headers: csfrWithTokenHeaders(csrfToken, accessToken),
            }
          )
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

  return (
    <>
      {showDialog.id === 'delete' && (
        <OKCancelDialog
          onResponse={(r) => {
            if (r === TEXT_OK) {
              deleteUser(showDialog.params!.user as IEdbUser)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          {`Are you sure you want to delete user ${
            (showDialog.params!.user as IEdbUser).publicId
          }?`}
        </OKCancelDialog>
      )}

      {showDialog.id === 'new' && (
        <EditUserDialog
          title={showDialog.params!.title as string}
          user={showDialog.params!.user as INewUser}
          setUser={(user: INewUser | undefined) => {
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
              updateUser(user)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
          roles={roles}
        />
      )}

      <RolesLayout title="Users">
        <HCenterRow>
          <BaseCol className="w-9/10 lg:w-3/4 gap-y-4">
            <BaseCol className="flex flex-col gap-y-4">
              <VCenterRow>
                <Button
                  variant="theme"
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
                  <PlusIcon stroke="stroke-white" /> <span>New User</span>
                </Button>
              </VCenterRow>
              <Card className="hidden xl:flex">
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
              </Card>

              <Card className="xl:hidden">
                <Table>
                  <TableHeader>
                    {smallTable.getHeaderGroups().map((headerGroup) => {
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
                    {smallTable.getRowModel().rows.map((row) => (
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
              </Card>
            </BaseCol>

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
          </BaseCol>
        </HCenterRow>
      </RolesLayout>
    </>
  )
}
