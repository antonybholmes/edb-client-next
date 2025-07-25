import { useRef, type BaseSyntheticEvent } from 'react'

import { FormInputError } from '@components/input-error'
import { Button } from '@themed/button'
import { Form, FormField, FormItem } from '@themed/form'

import { Input } from '@themed/input'
import { Label } from '@themed/label'

import { useEdbAuth } from '@lib/edb/edb-auth'

import { useForm } from 'react-hook-form'

import { TEXT_SIGN_IN } from '@/consts'

const UUID4_PATTERN =
  /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/

interface IForm {
  apiKey: string
}

interface IProps {
  apiKey?: string
}

export function SignInWithApiKeyPopover({ apiKey = '' }: IProps) {
  const { signInWithApiKey } = useEdbAuth()

  const btnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<IForm>({
    defaultValues: {
      apiKey,
    },
  })

  function onSubmit(data: IForm, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    signInWithApiKey(data.apiKey)
  }

  // async function reloadAccount() {
  //   const account = await loadAccountFromCookie(true)

  //   setAccount(account)
  // }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-2 text-xs"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Label>{TEXT_SIGN_IN} with API Key</Label>
        <FormField
          control={form.control}
          name="apiKey"
          rules={{
            required: {
              value: true,
              message: 'An API key is required',
            },
            minLength: {
              value: 1,
              message: 'An API key is required',
            },
            pattern: {
              value: UUID4_PATTERN,
              message: 'This does not seem like a valid API key',
            },
          }}
          render={({ field }) => (
            <FormItem className="col-span-1">
              <Input
                id="apiKey"
                className="grow"
                placeholder="API key..."
                {...field}
              />

              <FormInputError error={form.formState.errors.apiKey} />
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
  )
}
