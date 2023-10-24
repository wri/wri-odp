import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/20/solid";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    active: false,
  },
  {
    title: "Settings",
    href: "/settings",
    active: false,
  },
  {
    title: "Log Out",
    href: "/logout",
    active: false,
  },
];

export default function UserMenu() {
  return (
    <div className="text-right -ml-6 sm:ml-0 font-acumin">
      <Menu as="div" className="relative inline-block text-left  pr-1 z-50">
        <div>
          <Menu.Button>
            <div className="flex ">
              <UserCircleIcon className="text-black h-5 w-5 mr-2" />
              <div className="font-normal text-[1.1251rem] border-b-2 border-b-wri-gold">John Doe</div>
            </div>
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
          <Menu.Items className="absolute right-0 mt-2 w-52 whitespace-nowrap  origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-md text-base font-semibold focus:outline-none">
            {navigation.map((item) => {
              return (
                <div className="hover:bg-slate-100" key={`nav-${item.title}`}>
                  <div className="px-2 pr-4 py-4 " >
                    <Menu.Item>

                      <a
                        href={item.href}
                      >
                        {item.title}
                      </a>
                    </Menu.Item>
                  </div>
                </div>
              );
            })}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
