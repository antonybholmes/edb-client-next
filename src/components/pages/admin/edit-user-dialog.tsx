import { BaseCol } from '@layout/base-col'

import { TEXT_OK } from '@/consts'
import { FormInputError } from '@components/input-error'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import type { IEdbUser, IRole } from '@lib/edb/edb'
import { Form, FormField } from '@themed/form'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  NAME_PATTERN,
  PUBLIC_ID_REGEX,
  TEXT_EMAIL_ERROR,
  TEXT_USERNAME_DESCRIPTION,
  USERNAME_PATTERN,
} from '@layouts/signin-layout'
import { Input } from '@themed/input'
import { Label, LabelContainer } from '@themed/label'
import { ToggleGroup, ToggleGroupItem } from '@themed/toggle-group'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { TEXT_PASSWORD_PATTERN_DESCRIPTION } from '../account/myaccount/password-card'
import { PASSWORD_PATTERN } from '../account/password-email-dialog'

export interface INewUser extends IEdbUser {
  password: string
}

const FormSchema = z.object({
  publicId: z.string().regex(PUBLIC_ID_REGEX, {
    message: 'This does not seem like a valid id',
  }),
  firstName: z.union([
    z.literal(''),
    z
      .string()
      .regex(NAME_PATTERN, { message: 'This does not seem like a valid name' }),
  ]),
  lastName: z.union([
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
  roles: z.array(z.string()),
  apiKeys: z.array(z.string()),
  isLocked: z.boolean(),
})

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

  // const form = useForm<INewUser>({
  //   defaultValues: {
  //     ...user,
  //     password: '',
  //   },
  // })

  console.log('EditUserDialog user', user)

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      publicId: '',
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      roles: [],
      apiKeys: [],
      isLocked: false,
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
                <LabelContainer
                  id="firstName"
                  label="First Name"
                  labelPos="top"
                >
                  <Input
                    h="lg"
                    id="firstName"
                    className="w-full"
                    //label="First name"
                    placeholder="First name"
                    error={'firstName' in form.formState.errors}
                    {...field}
                  />

                  <FormInputError error={form.formState.errors.firstName} />
                </LabelContainer>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <LabelContainer id="lastName" label="Last Name" labelPos="top">
                  <Input
                    h="lg"
                    id="lastName"
                    className="w-full"
                    placeholder="Last name"
                    //label="Last name"
                    error={'lastName' in form.formState.errors}
                    {...field}
                  />

                  <FormInputError error={form.formState.errors.lastName} />
                </LabelContainer>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <LabelContainer id="username" label="Username" labelPos="top">
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
              <LabelContainer id="email" label="Email" labelPos="top">
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
              <LabelContainer id="password" label="Password" labelPos="top">
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
            name="publicId"
            render={({ field }) => {
              if (field.value) {
                return (
                  <LabelContainer
                    id="publicId"
                    label="Public Id"
                    labelPos="top"
                  >
                    <Input
                      h="lg"
                      id="publicId"
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
