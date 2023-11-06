import React from "react";
import {
  ExclamationCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  return (
    <section id="login-modal" className=" mb-4 font-acumin max-w-[24rem] mx-auto">
      <div className="mt-2 flex flex-col">
        <div className=" text-center">
          <ExclamationCircleIcon className="mx-auto mb-2 h-5 w-5" />
          <p className=" font-wri-black text-[0.813rem] font-light">
            Registration Not Available Yet! <b>Login for WRI Members Only.</b>{" "}
            You Can Still Use All Portal Features.
          </p>
          <h3 className="mt-8 text-[1.75rem] font-semibold">Log In</h3>
        </div>
        <div className="mt-4">
          <form action="" className="flex flex-col gap-y-4">
            <div className="relative mx-auto w-full rounded-md">
              <input
                type="text"
                placeholder="Username"
                className="shadow-wri-small peer block w-full rounded-md border-0 px-5 py-3 text-neutral-700 ring-1 ring-inset ring-gray-300 placeholder:text-neutral-700 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
              ></input>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center pr-3 text-neutral-700 peer-focus:text-[#3654A5]">
                <EnvelopeIcon className="h-5 w-5 " />
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[24rem] rounded-md">
              <input
                type="password"
                placeholder="Password"
                className="shadow-wri-small peer block w-full rounded-md border-0 px-5 py-3 text-neutral-700 ring-1 ring-inset ring-gray-300 placeholder:text-neutral-700 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
              ></input>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center pr-3 text-neutral-700 peer-focus:text-[#3654A5]">
                <LockClosedIcon className="h-5 w-5 " />
              </div>
            </div>

            <div className="-mt-2 text-right text-[0.875rem] font-light text-wri-black">
              Forgot password?
            </div>
            <button
              type="button"
              className="rounded-sm bg-wri-gold px-4 py-4 text-[1.125rem] font-semibold text-wri-black"
            >
              <Link href="/dashboard">
                Log In
              </Link></button>
          </form>
        </div>
        <div className="mt-8 flex items-center justify-center gap-x-2 text-center">
          <div className="border-1 h-0 w-20 border border-wri-gray text-[0.875rem] font-light" />
          <div className="text-wri-black ">or</div>
          <div className="border-1 h-0 w-20 border border-wri-gray text-[0.875rem] font-light" />
        </div>
        <div className="mt-8  flex justify-center rounded-sm py-4 outline outline-1 outline-wri-gold ">
          <div className="relative my-auto h-4 w-4">
            <Image src="/images/wri_logo.png" alt="comment" fill />
          </div>
          <div className="ml-2 w-fit text-base font-semibold text-wri-black ">
            Sign In with your WRI Credentials
          </div>
        </div>
      </div>
    </section>
  );
}
