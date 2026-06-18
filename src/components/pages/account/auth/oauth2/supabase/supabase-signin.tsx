import { BaseImage } from '@/components/base-image'
import { AppIcon } from '@/components/icons/app-icon'
import { FormInputError } from '@/components/input-error'
import { BaseCol } from '@/components/layout/base-col'
import { HCenterCol } from '@/components/layout/h-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { StrikeThroughMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  Form,
  FormField,
  FormItem,
} from '@/components/shadcn/ui/themed/v2/form'
import { TEXT_SIGN_IN } from '@/consts'
import { supabase } from '@/lib/auth/supabase'
import { APP_ACCOUNT_OAUTH2_SUPABASE_SIGNIN_CALLBACK_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { signinStateAtom } from '@/lib/edb/signin/edb-signin'
import { makeUuid } from '@/lib/id'
import { Card, CardHeader, CardTitle } from '@/themed/card'

import { config } from '@/config'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'
import { Toast } from '@base-ui/react/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Provider, Session } from '@supabase/supabase-js'
import { useAtom } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { useRef, useState, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FormSchema = z.object({
  name: z.string(),
  email: z.email({
    message: 'You must enter a valid email address.',
  }),
  token: z.string(),
})

export function SupabaseSignIn() {
  const [loading, setLoading] = useState(false)
  const { settings } = useEdbSettings()
  const { signInWithSupabase } = useEdbAuth()
  const [mode, setMode] = useState<'send' | 'verify'>('send')
  const [signinState] = useAtom(signinStateAtom)

  const btnRef = useRef<HTMLButtonElement>(null)
  // const [email, setEmail] = useState(
  //   settings?.users.length > 0 ? settings.users[0]!.email : ''
  // )
  const { add: addToast } = Toast.useToastManager()

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: settings?.users.length > 0 ? settings.users[0]!.name : '',
      email: settings?.users.length > 0 ? settings.users[0]!.email : '',
      token: '',
    },
  })

  async function onSubmit(
    data: { name: string; email: string; token: string },
    e: BaseSyntheticEvent | undefined
  ) {
    e?.preventDefault()

    if (!data.token) {
      //mode === 'send') {
      handleMagicLink(data.name, data.email)
    } else {
      handleOTP(data.email, data.token)
    }
  }

  async function handleMagicLink(name: string, email: string) {
    setLoading(true)

    await signout()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: APP_ACCOUNT_OAUTH2_SUPABASE_SIGNIN_CALLBACK_URL,
        shouldCreateUser: true,
        data: { display_name: name },
      },
    })
    setLoading(false)

    if (error) {
      //alert(error.message)

      addToast({
        id: makeUuid(),
        title: config.name,
        description: error.message,
        type: 'destructive',
      })
    } else {
      //alert('Check your email for a login link!')

      addToast({
        id: makeUuid(),
        title: 'Success',
        type: 'success',
        description: 'Check your email for a sign in link!',
        //variant: 'destructive',
      })

      setMode('verify')
    }
  }

  async function handleOTP(email: string, token: string) {
    let session: Session | null

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email',
    })

    console.log(data.session, error)

    if (error) {
      const { data, error } = await supabase.auth.getSession()

      //alert(error.message)

      if (error) {
        addToast({
          id: makeUuid(),
          title: config.name,
          description: error.message,
          type: 'destructive',
        })

        return
      } else {
        session = data.session
      }
    } else {
      session = data.session
    }

    try {
      console.log('here', session)
      await signInWithSupabase(session?.access_token ?? '')
      //setState(result.state)

      console.log('sup sign')
    } catch (error) {
      console.error(error)
    }
  }

  async function handleOAuth(provider: Provider) {
    console.log('handleOAuth', provider)

    await signout()

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: APP_ACCOUNT_OAUTH2_SUPABASE_SIGNIN_CALLBACK_URL,
      },
    })
    if (error) {
      alert(error.message)
    }
  }

  async function signout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error(error.message)
    }
  }

  return (
    <Card
      className="shadow-2xl gap-y-4 w-120 text-sm"
      rounded="2xl"
      variant="simple"
    >
      <CardHeader className="text-xl px-8 pt-8">
        <VCenterRow className="gap-x-2">
          <AppIcon size="w-10" />
          <CardTitle>Sign in to {config.name}</CardTitle>
        </VCenterRow>
      </CardHeader>

      <BaseCol className="gap-y-4 text-sm px-8">
        <Form {...form}>
          <form
            className="flex flex-col gap-y-2 text-sm"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-y-1">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    h="xl"
                    variant="alt"
                    //error={"name" in form.formState.errors}
                    {...field}
                  />
                  <FormInputError error={form.formState.errors.name} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-y-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    h="xl"
                    variant="alt"
                    //error={"email" in form.formState.errors}
                    {...field}
                  />
                  <FormInputError error={form.formState.errors.email} />
                </FormItem>
              )}
            />

            {/* {mode == 'verify' && ( */}
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-y-1">
                  <Input
                    id="token"
                    type="text"
                    placeholder="123456"
                    h="xl"
                    variant="alt"
                    //error={"email" in form.formState.errors}
                    {...field}
                  />
                  <FormInputError error={form.formState.errors.token} />
                </FormItem>
              )}
            />
            {/* )} */}

            <button ref={btnRef} type="submit" className="hidden" />
          </form>

          <Button
            variant="theme"
            size="xl"
            disabled={loading || !form.watch('email')}
            onClick={() => {
              btnRef.current?.click()
            }}
            className="group"
          >
            <div className="group-hover:w-5 group-hover:opacity-100 group-focus:w-5 group-focus:opacity-100 opacity-0 w-0 overflow-hidden trans-all">
              <ArrowRight className="w-5" />
            </div>
            <span>{TEXT_SIGN_IN}</span>
          </Button>
        </Form>

        {/* <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onTextChange={e => {
              validateE
              setEmail(e)}}
            h="lg"
          />
          <Button
            variant="theme"
            className="w-full"
            size="lg"
            onClick={handleMagicLink}
            disabled={loading || !email}
          >
              {loading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )} 
            Sign in with Email
          </Button> */}
      </BaseCol>

      <StrikeThroughMenuItem className="text-base px-16">
        or
      </StrikeThroughMenuItem>

      <HCenterCol className="mb-6">
        <Button
          variant="muted-light"
          className="w-full grid grid-cols-6 px-8 py-4"
          size="none"
          rounded="none"
          onClick={() => handleOAuth('google')}
        >
          <BaseImage
            src="/images/google.svg"
            alt="Google"
            className="h-6 w-6"
          />
          <span className="text-center col-span-4">Continue with Google</span>
          <></>
        </Button>
        <Button
          variant="muted-light"
          className="w-full grid grid-cols-6 px-8 py-4"
          size="none"
          rounded="none"
          onClick={() => handleOAuth('github')}
        >
          <BaseImage
            src="/images/github-mark.svg"
            alt="GitHub"
            className="h-6 w-6"
          />
          <span className="col-span-4 text-center">Continue with GitHub</span>
          <></>
        </Button>

        {/* <button onClick={() => signout()}>{TEXT_SIGN_OUT}</button> */}
      </HCenterCol>
    </Card>
  )
}
