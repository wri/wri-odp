import React from "react";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

export default function Footer({
  links = {
    primary: { title: "Explore Topics", href: "#" },
    secondary: { title: "Advanced Search", href: "#" },
  },
}) {
  return (
    <section
      id="footer"
      className="w-full  flex font-acumin flex-col mt-16 mb-6"
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

      <div className="flex flex-col w-full px-8 xxl:px-0  max-w-8xl mx-auto">
        <div className=" pt-16 lg:pl-16 flex flex-col items-center sm:items-start sm:flex-row gap-y-4 sm:gap-x-4 font-bold text-wri-black">
          <div className="w-full sm:w-1/5 flex flex-col items-center sm:items-start gap-y-4 mb-6 sm:mb-0">
            <p className="text-base font-bold">ABOUT WRI</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="w-full sm:w-1/5 flex flex-col items-center sm:items-start  gap-y-4 mb-6 sm:mb-0">
            <p className="text-base font-bold">USEFUL LINKS</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="w-full sm:w-1/5 flex flex-col items-center sm:items-start gap-y-4">
            <p className="text-base font-bold">GET STARTED</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="w-full sm:w-1/2 flex flex-col items-center sm:items-start gap-y-4 shrink xl:ml-20 mt-10 sm:mt-0">
            <p className="font-bold text-base sm:text-[1.375rem]">
              STAY UP TO DATE WITH THE NEWS{" "}
            </p>
            <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 w-full">
              <div className="outline outline-1 rounded-sm pl-1 py-2 gap-x-2 flex flex-row items-center min-w-fit  w-full">
                <div className=" my-auto">
                  <EnvelopeIcon className="w-5 h-5 text-wri-gray" />
                </div>
                <div className="grow shrink basis-auto">
                  <input
                    type="text"
                    placeholder="Enter your email address"
                    className=" focus:outline-none placeholder:text-xs text-xs font-normal w-full"
                  />
                </div>
              </div>
              <div className="px-4 py-2 sm:px-6 2xl:px-10 bg-wri-gold text-wri-black font-bold  text-[0.875rem] rounded-sm text-center">
                SUBSCRIBE
              </div>
            </div>
            <div className="flex flex-row gap-5">
              <div className="w-5 h-5 relative ">
                <Image src="/icons/fb.svg" alt="" fill />
              </div>
              <div className="w-5 h-5 relative ">
                <Image src="/icons/x.svg" alt={""} fill />
              </div>
              <div className="w-5 h-5 relative ">
                <Image src="/icons/linkedin.svg" alt={""} fill />
              </div>
              <div className="w-5 h-5 relative ">
                <Image src="/icons/mail.svg" alt={""} fill />
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full mx-auto pt-16 lg:pl-16  flex flex-col sm:flex-row  gap-y-8 sm:gap-y-4 items sm:items-start">
          <div className=" w-52 h-16 sm:w-56 sm:h-20 relative mx-auto sm:ml-0">
            <Image
              src="/images/WRI_logo_4c.png"
              alt="Picture of the author"
              fill
            />
          </div>
          <div className="mx-auto sm:ml-auto sm:mr-0   w-fit flex  items-end gap-x-1 font-normal text-base mt-auto">
            <span>
              Powered by{" "}
              <a href="#" className=" text-wri-green">
                Portal.js
              </a>{" "}
              from
            </span>
            <div className=" w-24 h-6 relative">
              <Image src="/images/datopian.png" alt="" fill></Image>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
