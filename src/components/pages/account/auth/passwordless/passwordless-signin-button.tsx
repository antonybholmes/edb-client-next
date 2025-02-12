"use client";

import { SESSION_AUTH_SIGNIN_URL } from "@/lib/edb/edb";

import { Button } from "@components/shadcn/ui/themed/button";

import { BaseCol } from "@/components/layout/base-col";
import { Input } from "@/components/shadcn/ui/themed/input";
import { TEXT_SIGN_IN } from "@/consts";
import { useToast } from "@/hooks/use-toast";
import { httpFetch } from "@/lib/http/http-fetch";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function PasswordlessSignInButton({
  redirectUrl = "",
}: {
  redirectUrl?: string;
}) {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  // some other page needs to force reload account details either
  // passwordless or regular so that on refresh this page can see if
  // the details have been loaded
  const [username, setUsername] = useState("");

  useEffect(() => {
    // the sign in callback includes this url so that the app can signin and
    // then return user to the page they were signing into as a convenience
    if (!redirectUrl) {
      // default to returning to current page if none specified. This is not
      // advantageous on the signin page itself as it may appear as though
      // user has not signed in even when they have. In this case it should
      // be manually set.
      redirectUrl = window.location.href;
    }
  }, []);

  // Allow users to signin
  return (
    <BaseCol className="gap-y-2">
      <Input
        id="username"
        placeholder="Username"
        //error={"username" in form.formState.errors}
        className=" rounded-theme"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <Button
        variant="theme"
        //className="w-full"
        size="lg"
        pad="lg"
        onClick={async () => {
          try {
            // to activate passwordless, simply use a blank password

            console.log(SESSION_AUTH_SIGNIN_URL);

            const res = await queryClient.fetchQuery({
              queryKey: ["signin"],
              queryFn: () =>
                httpFetch.postJson(SESSION_AUTH_SIGNIN_URL, {
                  body: {
                    username,
                    redirectUrl,
                  },
                }),
            });

            if (res.data.message.includes("email")) {
              toast({
                title: "Please check your email",
                description:
                  "We sent you an email containing a link you can use to sign in.",
              });

              return;
            }
          } catch (error) {
            console.log(error);
          }
        }}
        aria-label={TEXT_SIGN_IN}
      >
        {TEXT_SIGN_IN}
      </Button>
    </BaseCol>
  );
}
