import { ErrorAlert } from "@/components/_shared/Alerts";
import Spinner from "@/components/_shared/Spinner";
import type { GetServerSidePropsContext } from "next";
import { getCsrfToken, signIn } from "next-auth/react";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

export default function LoginPage({ csrfToken }: { csrfToken: string }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loggingIn, setLogin] = useState(false);
  const { register, handleSubmit } = useForm<{
    username: string;
    password: string;
  }>();
  return (
    <>
      <NextSeo title="Sign in" />
      <div className="flex h-full min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-10">
          <div>
            <Link
              aria-label="Home page"
              className="mx-auto flex justify-center text-3xl font-extrabold"
              href="/"
            >
              <span className="">WRI - ODP </span>
            </Link>
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight ">
              Sign in to your account
            </h2>
          </div>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form
              className="space-y-6"
              onSubmit={(event) =>
                void handleSubmit(async (data) => {
                  setLogin(true);
                  const signInStatus = await signIn("credentials", {
                    callbackUrl: "/",
                    redirect: true,
                    ...data,
                  });
                  if (signInStatus?.error) {
                    setLogin(false);
                    setErrorMessage(
                      "Could not find user please check your login and password",
                    );
                  }
                })(event)
              }
            >
              <input
                name="csrfToken"
                type="hidden"
                defaultValue={csrfToken ? csrfToken : ""}
              />
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6  "
                >
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    {...register("username")}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-stone-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6  "
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    autoComplete="current-password"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-stone-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <div className="col-span-full">
                  {match(loggingIn)
                    .with(false, () => (
                      <button
                        type="submit"
                        className="hover:bg-stone-800-hover flex w-full justify-center rounded-md bg-stone-800 px-3 py-1.5 text-sm font-semibold leading-6  text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
                      >
                        Sign in
                      </button>
                    ))
                    .otherwise(() => (
                      <button
                        disabled
                        className="hover:bg-stone-800-hover flex w-full justify-center rounded-md bg-stone-800 px-3 py-1.5 text-sm font-semibold leading-6  text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 "
                      >
                        <Spinner className="text-white" />
                      </button>
                    ))}
                </div>
              </div>
            </form>
          </div>
          {errorMessage && <ErrorAlert text={errorMessage} />}
        </div>
      </div>
    </>
  );
}
