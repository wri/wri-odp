import React from "react";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { Button } from "./Button";

export default function Footer({
  links = {
    primary: { title: "Explore Topics", href: "#" },
    secondary: { title: "Advanced Search", href: "#" },
  },
  style = "mt-16"
}) {
  return (
    <section
      id="footer"
      className={`w-full  flex font-acumin flex-col pb-16 ${style}`}
    >
      <div className=" w-full bg-wri-green">
        <div className=" flex flex-col px-8 xxl:px-0  max-w-8xl mx-auto py-10">
          <p className="text-white mb-4 font-bold text-[1.5rem] text-center sm:text-start">
            Didn&apos;t find what you were looking for?{" "}
          </p>
          <div className="flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 font-bold">
            <a
              href={links.primary.href}
              className=" bg-wri-gold text-wri-black text-center px-8 py-4 rounded-sm text-base"
            >
              {" "}
              {links.primary.title}
            </a>
            <a
              href={links.secondary.href}
              className=" bg-white text-wri-black text-center px-8 py-4 rounded-sm text-base border-2 border-wri-gold"
            >
              {" "}
              {links.secondary.title}
            </a>
          </div>
        </div>
      </div>
<div className="default-home-container mx-auto flex w-full flex-col pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 items-center gap-y-8 pt-16 font-bold text-wri-black sm:flex-row sm:items-start">
          <div className="mb-6 flex w-full flex-col items-center gap-y-4 sm:mb-0 sm:items-start">
            <p className="text-base font-bold">ABOUT WRI</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="mb-6 flex w-full flex-col items-center gap-y-4  sm:mb-0 sm:items-start">
            <p className="text-base font-bold">USEFUL LINKS</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="flex w-full flex-col items-center gap-y-4 sm:items-start">
            <p className="text-base font-bold">GET STARTED</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="ml-auto mt-10 lg:col-span-2 lg:w-[90%] flex w-full shrink flex-col items-center gap-y-4 sm:mt-0 sm:items-start xl:min-w-[420px]">
            <div className="font-acumin text-[22px] font-bold text-gray-800">
              STAY UP TO DATE WITH THE NEWS{" "}
            </div>
            <div className="flex w-full flex-col gap-x-2 gap-y-4 lg:flex-row justify-between">
              <div className="relative grow">
                <input
                  type="text"
                  className="h-11 w-full peer grow rounded border-0 shadow outline-0 ring-0 ring-offset-0 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 "
                />
                <div className="absolute pointer-events-none peer-focus:hidden inset-y-0 left-0 flex gap-x-2 items-center pl-3">
                  <EnvelopeIcon className="h-6 w-5 text-gray-400" />
                  <span className="text-xs text-gray-400">Enter your email</span>
                </div>
              </div>
              <Button>SUBSCRIBE</Button>
            </div>
            <div className="flex flex-row gap-5">
              <div className="relative h-5 w-5 ">
                <Image src="/icons/fb.svg" alt="" fill />
              </div>
              <div className="relative h-5 w-5 ">
                <Image src="/icons/x.svg" alt={""} fill />
              </div>
              <div className="relative h-5 w-5 ">
                <Image src="/icons/linkedin.svg" alt={""} fill />
              </div>
              <div className="relative h-5 w-5 ">
                <Image src="/icons/mail.svg" alt={""} fill />
              </div>
            </div>
          </div>
        </div>
        <div className="items mx-auto flex w-full flex-col gap-y-8 pt-16 sm:flex-row sm:gap-y-4">
          <div className=" relative mx-auto h-16 w-52 sm:ml-0 sm:h-20 sm:w-56">
            <Image
              src="/images/WRI_logo_4c.png"
              alt="Picture of the author"
              fill
            />
          </div>
          <div className="mt-auto flex items-end gap-x-1  text-base font-normal sm:ml-auto">
            <span>
              Powered by{" "}
              <a href="#" className=" text-wri-green">
                Portal.js
              </a>{" "}
              from
            </span>
            <div className=" relative h-6 w-24">
              <Image src="/images/datopian.png" alt="" fill></Image>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
