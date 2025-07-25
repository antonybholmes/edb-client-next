import {
  TEXT_USERNAME_REQUIRED,
  USERNAME_PATTERN,
} from '@layouts/signin-layout'

import { useRef, type BaseSyntheticEvent } from 'react'

import { FormInputError } from '@components/input-error'
import { Button } from '@themed/button'
import { Form, FormField, FormItem } from '@themed/form'

import { Input } from '@themed/input'
import { Label } from '@themed/label'

import { useEdbAuth } from '@lib/edb/edb-auth'

import { useForm } from 'react-hook-form'

import {
  PASSWORD_PATTERN,
  TEXT_PASSWORD_REQUIRED,
} from '@/components/pages/account/password-email-dialog'
import { TEXT_SIGN_IN } from '@/consts'

interface IForm {
  username: string
  password: string
}

export function SignInWithUsernamePasswordPopover() {
  const { signInWithUsernamePassword } = useEdbAuth()

  const btnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<IForm>({
    defaultValues: {
      username: '',
      password: '',
    },
  })

  function onSubmit(data: IForm, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    signInWithUsernamePassword(data.username, data.password)
  }

  // async function reloadAccount() {
  //   const account = await loadAccountFromCookie(true)

  //   setAccount(account)
  // }

  return (
    <>
      <Label className="font-semibold">{TEXT_SIGN_IN}</Label>
      <Form {...form}>
        <form
          className="flex flex-col gap-y-2 text-xs"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="username"
            rules={{
              required: {
                value: true,
                message: TEXT_USERNAME_REQUIRED,
              },
              minLength: {
                value: 1,
                message: TEXT_USERNAME_REQUIRED,
              },
              pattern: {
                value: USERNAME_PATTERN,
                message: 'This does not seem like a valid username',
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-1">
                <Input
                  id="username"
                  className="grow"
                  placeholder="Username..."
                  {...field}
                />

                <FormInputError error={form.formState.errors.username} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            rules={{
              required: {
                value: true,
                message: TEXT_PASSWORD_REQUIRED,
              },
              minLength: {
                value: 1,
                message: TEXT_PASSWORD_REQUIRED,
              },
              pattern: {
                value: PASSWORD_PATTERN,
                message: 'This does not seem like a valid password',
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-1">
                <Input
                  id="password"
                  className="grow"
                  placeholder="Password..."
                  {...field}
                />

                <FormInputError error={form.formState.errors.password} />
              </FormItem>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />

          <Button
            variant="theme"
            size="lg"
            //className="w-full"
            onClick={() => btnRef.current?.click()}
          >
            {TEXT_SIGN_IN}
          </Button>
        </form>
      </Form>
    </>
  )
}
