import React, { Fragment } from "react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/20/solid";
import Link from "next/link";

export default function Header() {
  return (
    <section
      id="header"
      className="w-full py-10 px-4 sm:px-6 xxl:px-0 max-w-[1380px] mx-auto flex font-acumin items-baseline"
    >
      <Link href="/" className=" w-fit sm:w-52 h-fit">
        <Image
          src="/images/WRI_logo_4c.png"
          alt="Picture of the author"
          width={400}
          height={500}
          className="hidden sm:block"
        />
        <Image
          src="/images/WRI_logo_4c.png"
          alt="Picture of the author"
          width={150}
          height={300}
          className="block sm:hidden"
        />
      </Link>
      <div className=" ml-auto flex mt-auto gap-x-6">
        <div className=" hidden sm:flex gap-x-6 font-semibold text-[1.0625rem] text-wri-black">
          <a href="" className=" border-b-2 border-b-wri-gold">
            Search
          </a>
          <a href="" className=" ">
            Teams
          </a>
          <a href="" className=" ">
            Topics
          </a>
          <a href="" className="">
            About
          </a>
        </div>
        <div>
          <a
            href=""
            className="outline-wri-gold outline-1 outline font-bold text-xs tracking-tighter sm:text-base text-black rounded-sm p-2 sm:px-4 sm:py-2 text-center"
          >
            LOG IN
          </a>
        </div>
        <div className="text-right -ml-6 sm:hidden">
          <Menu as="div" className="relative inline-block text-left mt-1 pr-1">
            <div>
              <Menu.Button>
                <Bars3Icon className="text-black h-5 w-5" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-16 whitespace-nowrap p-2 origin-top-right divide-y divide-gray-100 rounded-sm bg-white shadow-lg text-xs font-medium focus:outline-none">
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a className={`${active && "bg-blue-500"}`} href="#">
                        Search
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a className={`${active && "bg-blue-500"}`} href="#">
                        Teams
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a className={`${active && "bg-blue-500"}`} href="#3">
                        Topics
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a className={`${active && "bg-blue-500"}`} href="#">
                        About
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </section>
  );
}
