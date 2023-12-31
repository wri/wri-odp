import React, { Fragment } from "react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const { asPath } = useRouter();

  const navigation = [
    {
      title: "Search",
      href: "/search",
      active: false,
    },
    {
      title: "Teams",
      href: "/teams",
      active: false,
    },
    {
      title: "Topics",
      href: "/topics",
      active: false,
    },
    {
      title: "About",
      href: "/about",
      active: false,
    },
  ];

  navigation.forEach((item) => {
    item.active = asPath.startsWith(item.href);
  });

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
          {navigation.map((item) => {
            return (
              <a
                key={`nav-${item.title}`}
                href={item.href}
                className={item.active ? "border-b-2 border-b-wri-gold" : ""}
              >
                {item.title}
              </a>
            );
          })}
        </div>
        <div>
          <a
            href=""
            className="outline-wri-gold outline-1 outline font-bold text-xs tracking-tighter sm:text-base text-black rounded-sm p-2 sm:px-4 sm:py-2 text-center mr-5 sm:mr-0"
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
                {navigation.map((item) => {
                  return (
                    <div className="px-1 py-1" key={`nav-${item.title}`}>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={`${active && "bg-blue-500"}`}
                            href={item.href}
                          >
                            {item.title}
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  );
                })}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </section>
  );
}
