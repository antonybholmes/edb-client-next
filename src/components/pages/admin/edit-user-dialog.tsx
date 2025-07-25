import { BaseCol } from '@layout/base-col'

import { TEXT_OK } from '@/consts'
import { FormInputError } from '@components/input-error'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import type { IEdbUser, IRole } from '@lib/edb/edb'
import { Form, FormField, FormItem } from '@themed/form'

import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  TEXT_EMAIL_ERROR,
  TEXT_USERNAME_DESCRIPTION,
  TEXT_USERNAME_REQUIRED,
  USERNAME_PATTERN,
} from '@layouts/signin-layout'
import { Input } from '@themed/input'
import { Label } from '@themed/label'
import { ToggleGroup, ToggleGroupItem } from '@themed/toggle-group'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import {
  PASSWORD_PATTERN,
  TEXT_PASSWORD_DESCRIPTION,
} from '../account/password-email-dialog'

export interface INewUser extends IEdbUser {
  password: string
}

// export const NEW_USER: INewUser = {
//   password: '',
//   uuid: '',
//   username: '',
//   email: '',
//   firstName: '',
//   lastName: '',
//   roles: [],
//   isLocked: false
// }

interface IEditUserDialogProps {
  open?: boolean
  title?: string
  user: INewUser | undefined
  setUser: (user: INewUser | undefined, response: string) => void
  roles: IRole[]
}

export function EditUserDialog({
  open = true,
  title,
  user,
  setUser,
  roles,
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

  const form = useForm<INewUser>({
    defaultValues: {
      ...user,
      password: '',
    },
  })

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
              name="firstName"
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
                <FormItem>
                  <Input
                    h="lg"
                    id="firstName"
                    className="w-full"
                    label="First name"
                    placeholder="First name"
                    error={'firstName' in form.formState.errors}
                    {...field}
                  />

                  <FormInputError error={form.formState.errors.firstName} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              rules={{
                pattern: {
                  value: NAME_PATTERN,
                  message: 'This does not seem like a valid name',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <Input
                    h="lg"
                    id="lastName"
                    className="w-full"
                    placeholder="Last name"
                    label="Last name"
                    error={'lastName' in form.formState.errors}
                    {...field}
                  />

                  <FormInputError error={form.formState.errors.lastName} />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            rules={{
              required: {
                value: true,
                message: TEXT_USERNAME_REQUIRED,
              },
              pattern: {
                value: USERNAME_PATTERN,
                message: TEXT_USERNAME_DESCRIPTION,
              },
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-y-1">
                <Input
                  h="lg"
                  id="name"
                  label="Username"
                  placeholder="Username"
                  error={'username' in form.formState.errors}
                  {...field}
                />
                <FormInputError error={form.formState.errors.username} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            rules={{
              required: {
                value: true,
                message: 'An email address is required',
              },
              pattern: {
                value: EMAIL_PATTERN,
                message: TEXT_EMAIL_ERROR,
              },
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-y-1">
                <Input
                  h="lg"
                  id="email"
                  label="Email"
                  placeholder="Email"
                  error={'email' in form.formState.errors}
                  {...field}
                />

                <FormInputError error={form.formState.errors.email} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            rules={{
              pattern: {
                value: PASSWORD_PATTERN,
                message: TEXT_PASSWORD_DESCRIPTION,
              },
            }}
            render={({ field }) => (
              <FormItem>
                <Input
                  h="lg"
                  id="password"
                  error={'password' in form.formState.errors}
                  type="password"
                  label={'Password'}
                  placeholder="Password"
                  {...field}
                />
                <FormInputError error={form.formState.errors.password} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publicId"
            render={({ field }) => {
              if (field.value) {
                return (
                  <FormItem>
                    <Input
                      h="lg"
                      id="publicId"
                      className="w-full"
                      placeholder="User Id"
                      label="User Id"
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormItem>
                )
              } else {
                return <></>
              }
            }}
          />

          <FormField
            control={form.control}
            name="roles"
            render={({ field }) => (
              <BaseCol className="gap-y-2">
                <Label className="font-bold">Roles</Label>
                <ToggleGroup
                  type="multiple"
                  justify="start"
                  variant="outline"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row gap-x-1"
                >
                  {roles.map((role, ri) => {
                    return (
                      <ToggleGroupItem value={role.name} key={ri}>
                        {role.name}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
              </BaseCol>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
