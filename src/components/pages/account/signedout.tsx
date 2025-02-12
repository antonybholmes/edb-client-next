"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from "@components/shadcn/ui/themed/card";

import { SignInLayout } from "@/layouts/signin-layout";
import { EdbAuthContext } from "@/lib/edb/edb-auth-provider";
import { CoreProviders } from "@providers/core-providers";
import { useContext, useEffect } from "react";

function SignedOutPage() {
  const { signoutUser } = useContext(EdbAuthContext);

  useEffect(() => {
    signoutUser();
  }, []);

  return (
    <SignInLayout showSignInError={false}>
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>You have been signed out</CardTitle>
            <CardDescription>
              It&apos;s a good idea to close all browser windows.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-row items-start gap-2">
            {/* <ButtonLink
              variant="theme"
              //className="w-full"
              size="lg"
              pad='lg'
              href={SIGN_IN_ROUTE}
              aria-label={TEXT_SIGN_IN}
            >
              {TEXT_SIGN_IN}
            </ButtonLink> */}

            {/* <Auth0SignInButton /> */}
          </CardFooter>
        </Card>

        {/* <CreateAccountLink /> */}
      </CenteredCardContainer>
    </SignInLayout>
  );
}

export function SignedOutQueryPage() {
  return (
    <CoreProviders cacheSession={false}>
      <SignedOutPage />
    </CoreProviders>
  );
}
