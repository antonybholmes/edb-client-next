"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from "@components/shadcn/ui/themed/card";

import { HeaderLayout } from "@layouts/header-layout";

import {
  EDB_ACCESS_TOKEN_COOKIE,
  EDB_SESSION_COOKIE,
  EDB_USER_COOKIE,
  SIGN_IN_ROUTE,
} from "@/lib/edb/edb";

import { ButtonLink } from "@components/link/button-link";

import { TEXT_SIGN_IN } from "@/consts";

import { EdbAuthContext } from "@/lib/edb/edb-auth-provider";
import Cookies from "js-cookie";
import { useContext, useEffect } from "react";

function SignOutPage() {
  const { signoutUser } = useContext(EdbAuthContext);

  useEffect(() => {
    // call signout
    async function signout() {
      try {
        await signoutUser();

        Cookies.remove(EDB_SESSION_COOKIE);
        Cookies.remove(EDB_ACCESS_TOKEN_COOKIE);
        Cookies.remove(EDB_USER_COOKIE);
      } catch (err) {
        console.error(err);
      }
    }

    signout();
  }, []);

  return (
    <HeaderLayout>
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>You have been signed out</CardTitle>
            <CardDescription>
              It&apos;s a good idea to close all browser windows.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-row items-start gap-2">
            <ButtonLink
              variant="theme"
              //className="w-full"
              size="lg"
              href={SIGN_IN_ROUTE}
              aria-label={TEXT_SIGN_IN}
            >
              {TEXT_SIGN_IN}
            </ButtonLink>
          </CardFooter>
        </Card>

        {/* <CreateAccountLink /> */}
      </CenteredCardContainer>
    </HeaderLayout>
  );
}

export function SignOutQueryPage() {
  return <SignOutPage />;
}
