import { FormInputError } from '@/components/input-error'
import { Form, FormField } from '@/components/shadcn/ui/themed/v2/form'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import type { IEdbUser, INewUser, IRBACGroup } from '@/lib/edb/edb'

import { PropRow } from '@/components/dialogs/prop-row'
import {
  NAME_PATTERN,
  PUBLIC_ID_REGEX,
  TEXT_EMAIL_ERROR,
  TEXT_USERNAME_DESCRIPTION,
  USERNAME_PATTERN,
} from '@/layouts/signin-layout'
import { Input } from '@/themed/v2/input'
import { GroupToggle, ToggleGroup } from '@/themed/v2/toggle-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

import {
  PASSWORD_PATTERN,
  TEXT_PASSWORD_PATTERN_DESCRIPTION,
} from '@/components/pages/account/password-email-dialog'

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

interface IEditUserDialogProps extends IModalProps<INewUser> {
  open?: boolean
  title?: string | undefined
  user: IEdbUser | undefined

  groups: IRBACGroup[]
}

export function EditUserDialog({
  open = true,
  title,
  user,
  groups,
  onResponse,
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

    onResponse?.(TEXT_OK, data)
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
          onResponse?.(r)
        }
      }}
      //contentVariant="glass"
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-4 text-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
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
              <PropRow title="First Name" labelW="md">
                <Input
                  h="lg"
                  id="name"
                  //label="First name"
                  placeholder="First name"
                  error={'name' in form.formState.errors}
                  {...field}
                />

                <FormInputError error={form.formState.errors.name} />
              </PropRow>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <PropRow title="Username" labelW="md">
                <Input
                  h="lg"
                  id="username"
                  //label="Username"
                  placeholder="Username"
                  error={'username' in form.formState.errors}
                  {...field}
                />
                <FormInputError error={form.formState.errors.username} />
              </PropRow>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <PropRow title="Email" labelW="md">
                <Input
                  h="lg"
                  id="email"
                  //label="Email"
                  placeholder="Email"
                  error={'email' in form.formState.errors}
                  {...field}
                />

                <FormInputError error={form.formState.errors.email} />
              </PropRow>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <PropRow title="Password" labelW="md">
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
              </PropRow>
            )}
          />

          <FormField
            control={form.control}
            name="id"
            render={({ field }) => {
              if (field.value) {
                return (
                  <PropRow title="User Id" labelW="md">
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
                  </PropRow>
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
              <PropRow title="Groups" labelW="md">
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
                      <GroupToggle
                        value={group.id}
                        key={group.id}
                        className="text-xs px-2"
                      >
                        {group.name}
                      </GroupToggle>
                    )
                  })}
                </ToggleGroup>
              </PropRow>
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
