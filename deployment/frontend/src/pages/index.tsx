import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "Making sure TRPC Works" });

  return (
    <>
      <Head>
        <title>WRI - ODP</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            WRI ODP
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        {sessionData && (
          <span>
            User <span className="font-bold">{sessionData.user?.name}</span> is part of the following teams{" "}
            <ol className="list-disc py-2">
            {sessionData.user?.teams.map((team) => <li key={team.name} className="text-start">{team.name}</li>)}
            </ol>
          </span>
        )}
      </p>
      {sessionData ? (
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          onClick={() => void signOut()}
        >Sign out</button>
      ) : (
        <Link
          href="/auth/signin"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
