import { BaseCol } from '@/layout/base-col'

import { FormInputError } from '@/components/input-error'
import { Form, FormField } from '@/components/shadcn/ui/themed/v2/form'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import type { IEdbUser, IRBACGroup } from '@/lib/edb/edb'

import { Label, LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import { Toggle } from '@/components/shadcn/ui/themed/v2/toggle'
import {
  NAME_PATTERN,
  PUBLIC_ID_REGEX,
  TEXT_EMAIL_ERROR,
  TEXT_USERNAME_DESCRIPTION,
  USERNAME_PATTERN,
} from '@/layouts/signin-layout'
import { Input } from '@/themed/v2/input'
import { ToggleGroup } from '@/themed/v2/toggle-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { TEXT_PASSWORD_PATTERN_DESCRIPTION } from '../account/myaccount/password-card'
import { PASSWORD_PATTERN } from '../account/password-email-dialog'

export interface INewUser extends IEdbUser {
  password: string
  // we need to track selected groups  as strings
  // to make toggle group work
  selectedGroups: string[]
}

const UserFormSchema = z.object({
  id: z.string().regex(PUBLIC_ID_REGEX, {
    message: 'This does not seem like a valid id',
  }),
  name: z.union([
    z.literal(''),
    z
      .string()
      .regex(NAME_PATTERN, { message: 'This does not seem like a valid name' }),
  ]),

  username: z.union([
    z.email({ message: TEXT_EMAIL_ERROR }),
    z.string().regex(USERNAME_PATTERN, { message: TEXT_USERNAME_DESCRIPTION }),
  ]),
  email: z.email({ message: TEXT_EMAIL_ERROR }),
  password: z.union([
    z.literal(''),
    z.string().regex(PASSWORD_PATTERN, {
      message: TEXT_PASSWORD_PATTERN_DESCRIPTION,
    }),
  ]),

  groups: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      roles: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          permissions: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
            })
          ),
        })
      ),
    })
  ),
  apiKeys: z.array(z.string()),
  authProviders: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      updatedAt: z.string(),
    })
  ),
  isLocked: z.boolean(),
  selectedGroups: z.array(z.string()),
})

interface IEditUserDialogProps {
  open?: boolean
  title?: string
  user: INewUser | undefined
  setUser: (
    user: INewUser | undefined,

    response: string
  ) => void
  groups: IRBACGroup[]
}

export function EditUserDialog({
  open = true,
  title,
  user,
  setUser,
  groups,
}: IEditUserDialogProps) {
  if (!title) {
    title = `Edit User`
  }

  const btnRef = useRef<HTMLButtonElement>(null)

  function onSubmit(data: INewUser, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    // if (!hasErrors && jwtData) {
    //   update(data)
    // }

    setUser(data, TEXT_OK)
  }

  // const form = useForm<INewUser>({
  //   defaultValues: {
  //     ...user,
  //     password: '',
  //   },
  // })

  console.log('EditUserDialog user', user)

  const form = useForm({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      id: '',
      name: '',
      username: '',
      email: '',
      password: '',
      authProviders: [],
      apiKeys: [],
      isLocked: false,
      groups: [],
      selectedGroups: user?.groups.map((g) => g.id) || [],
      ...user,
    },
  })

  console.log('EditUserDialog user', user, form.formState.errors)

  return (
    <OKCancelDialog
      open={open}
      title={title}
      onResponse={(r) => {
        if (r === TEXT_OK) {
          btnRef.current?.click()
        } else {
          setUser(undefined, r)
        }
      }}
      //contentVariant="glass"
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-4 text-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              // rules={{
              //   required: {
              //     value: true,
              //     message: TEXT_NAME_REQUIRED,
              //   },
              //   minLength: {
              //     value: 1,
              //     message: TEXT_NAME_REQUIRED,
              //   },
              //   pattern: {
              //     value: NAME_PATTERN,
              //     message: 'This does not seem like a valid name',
              //   },
              // }}
              render={({ field }) => (
                <LabelContainer label="First Name" labelPos="top">
                  <Input
                    h="lg"
                    id="name"
                    className="w-full"
                    //label="First name"
                    placeholder="First name"
                    error={'name' in form.formState.errors}
                    {...field}
                  />

                  <FormInputError error={form.formState.errors.name} />
                </LabelContainer>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <LabelContainer label="Username" labelPos="top">
                <Input
                  h="lg"
                  id="username"
                  //label="Username"
                  placeholder="Username"
                  error={'username' in form.formState.errors}
                  {...field}
                />
                <FormInputError error={form.formState.errors.username} />
              </LabelContainer>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <LabelContainer label="Email" labelPos="top">
                <Input
                  h="lg"
                  id="email"
                  //label="Email"
                  placeholder="Email"
                  error={'email' in form.formState.errors}
                  {...field}
                />

                <FormInputError error={form.formState.errors.email} />
              </LabelContainer>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <LabelContainer label="Password" labelPos="top">
                <Input
                  h="lg"
                  id="password"
                  error={'password' in form.formState.errors}
                  type="password"
                  //label={'Password'}
                  placeholder="Password"
                  {...field}
                />
                <FormInputError error={form.formState.errors.password} />
              </LabelContainer>
            )}
          />

          <FormField
            control={form.control}
            name="id"
            render={({ field }) => {
              if (field.value) {
                return (
                  <LabelContainer label="User Id" labelPos="top">
                    <Input
                      h="lg"
                      id="id"
                      className="w-full"
                      placeholder="User Id"
                      //label="User Id"
                      readOnly
                      disabled
                      {...field}
                    />
                  </LabelContainer>
                )
              } else {
                return <></>
              }
            }}
          />

          {/* <FormField
            control={form.control}
            name="apiKeys"
            render={({ field }) => (
              <FormItem>
                <Input
                  h="lg"
                  id="apiKeys"
                  className="w-full"
                  placeholder="API Keys"
                  //label="User Id"
                  readOnly
                  disabled
                  {...field}
                />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="selectedGroups"
            render={({ field }) => (
              <BaseCol className="gap-y-2">
                <Label className="font-bold">Groups</Label>
                <ToggleGroup
                  multiple={true}
                  justify="start"
                  //variant="outline"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="gap-x-1"
                >
                  {groups.map((group) => {
                    return (
                      <Toggle
                        value={group.id}
                        key={group.id}
                        className="text-xs px-2"
                      >
                        {group.name}
                      </Toggle>
                    )
                  })}
                </ToggleGroup>
              </BaseCol>
            )}
          />

          <FormField
            control={form.control}
            name="authProviders"
            render={({ field }) => (
              <span>{field.value?.map((p) => p.name).join(', ')}</span>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
