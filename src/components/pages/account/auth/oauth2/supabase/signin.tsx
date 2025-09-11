import { BaseImage } from '@/components/base-image'
import { AppIcon } from '@/components/icons/app-icon'
import { FormInputError } from '@/components/input-error'
import { BaseCol } from '@/components/layout/base-col'
import { HCenterCol } from '@/components/layout/h-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Button } from '@/components/shadcn/ui/themed/button'
import { Card, CardHeader, CardTitle } from '@/components/shadcn/ui/themed/card'
import { toast } from '@/components/shadcn/ui/themed/crisp'
import { Form, FormField, FormItem } from '@/components/shadcn/ui/themed/form'
import { Input } from '@/components/shadcn/ui/themed/input'
import { APP_NAME, TEXT_SIGN_IN } from '@/consts'
import { supabase } from '@/lib/auth/supabase'
import { APP_OAUTH2_CALLBACK_URL, MYACCOUNT_ROUTE } from '@/lib/edb/edb'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Provider } from '@supabase/supabase-js'
import { ArrowRight } from 'lucide-react'
import { useRef, useState, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FormSchema = z.object({
  email: z.email({
    message: 'You must enter a valid email address.',
  }),
})

export function SupabaseSignIn({
  redirectTo = MYACCOUNT_ROUTE,
}: {
  redirectTo?: string
}) {
  const [loading, setLoading] = useState(false)
  const { settings } = useEdbSettings()

  const btnRef = useRef<HTMLButtonElement>(null)
  // const [email, setEmail] = useState(
  //   settings?.users.length > 0 ? settings.users[0]!.email : ''
  // )

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: settings?.users.length > 0 ? settings.users[0]!.email : '',
    },
  })

  async function onSubmit(
    data: { email: string },
    e: BaseSyntheticEvent | undefined
  ) {
    e?.preventDefault()

    handleMagicLink(data.email)
  }

  async function handleMagicLink(email: string) {
    setLoading(true)

    await signout()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${APP_OAUTH2_CALLBACK_URL}?redirect=${redirectTo}`,
      },
    })
    setLoading(false)

    if (error) {
      //alert(error.message)

      toast({
        title: APP_NAME,
        description: error.message,
        variant: 'destructive',
      })
    } else {
      //alert('Check your email for a login link!')

      toast({
        title: 'Success',
        variant: 'success',
        description: 'Check your email for a sign in link!',
        //variant: 'destructive',
      })
    }
  }

  async function handleOAuth(provider: Provider) {
    console.log('handleOAuth', provider)

    await signout()

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${APP_OAUTH2_CALLBACK_URL}?redirect=${encodeURIComponent(redirectTo)}`,
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
      className="shadow-2xl gap-y-8 w-105 text-sm"
      rounded="2xl"
      variant="simple"
    >
      <CardHeader className="text-xl px-8 pt-8">
        <VCenterRow className="gap-x-2">
          <AppIcon w="w-10" />
          <CardTitle>Sign in to {APP_NAME}</CardTitle>
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

            <button ref={btnRef} type="submit" className="hidden" />
          </form>

          <Button
            variant="theme"
            size="xl"
            disabled={loading || !form.watch('email')}
            onClick={() => btnRef.current?.click()}
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

      <div className="relative text-center px-8">
        <span className="bg-background text-base font-bold px-4 z-10 relative">
          or
        </span>
        <div className="absolute top-1/2 -translate-y-1/2 left-16 right-16 h-[2px] border-b border-border" />
      </div>

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
