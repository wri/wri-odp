import { Fragment, useState } from "react";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import UserProfile from "./UserProfile";
import { useRouter } from "next/router";


const routes = [
  {
    name: "Dashboard",
    href: "default",
    active: true,
    count: 0
  },
  {
    name: "Notifications",
    href: "/notifications",
    active: false,
    count: 3
  },
  {
    name: "Requests for approval",
    href: "/approval-request",
    active: false,
    count: 1
  },
  {
    name: "Activity Stream",
    href: "/activity-stream",
    active: false,
    count: 0
  },
  {
    name: "Datasets",
    href: "/datasets",
    active: false,
    count: 0
  },
  {
    name: "Teams",
    href: "/teams",
    active: false,
    count: 0
  },
  {
    name: "Topics",
    href: "/topics",
    active: false,
    count: 0
  },
  {
    name: "Users",
    href: "/users",
    active: false,
    count: 0
  }
]

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { asPath } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = routes.map((item) => {
    const isPath = asPath.split("/dashboard")[1];
    if (isPath && isPath.split("/").length > 1) {
      const pathExist = isPath.includes(item.href)
      return {...item, active: pathExist}
    }
    return item
  });

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div className="flex font-acumin">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full flex-1 md:max-w-sm">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto   bg-wri-green pb-4">
                    <nav className="flex flex-1 flex-col ">
                      <ul role="list" className="flex flex-1 flex-col gap-y-2">
                        <li>
                          <UserProfile />
                        </li>
                        {
                          navigation.map((item) => {
                            return (
                              <li key={item.name} className={`text-center py-6 ${item.active ? "bg-white text-wri-black" : " text-white"}`}>
                                <a
                                  href={item.href.includes("default") ? "./" : `/dashboard${item.href}`}
                                  className="flex w-full justify-center items-center gap-x-2"
                                >
                                  <div className="font-normal text-[1.125rem]">{item.name}</div>
                                  {item.count ? (<div className="text-[0.688rem] font-semibold bg-wri-gold text-black  flex justify-center items-center w-4 h-4 rounded-full ">{item.count}</div>) : ""}
                                </a>
                              </li>
                            )
                          })
                        }
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <Disclosure defaultOpen>
          <>
            <Disclosure.Panel
              as="div"
              className="hidden w-[20%] min-w-[20%] lg:z-10 lg:flex lg:flex-col "
            >
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5  pb-4  bg-wri-green">
                <nav className="flex flex-1 flex-col ">
                  <ul role="list" className="flex flex-1 flex-col gap-y-2">
                    <li>
                      <UserProfile />
                    </li>
                    {
                      navigation.map((item) => {
                        return (
                          <li key={item.name} className={` text-center py-6 hover:bg-white hover:text-wri-black ${item.active ? "bg-white text-wri-black" : " text-white"}`}>
                            <a
                              href={item.href.includes("default") ? "./" : `/dashboard${item.href}`}
                              className="flex w-full justify-center items-center gap-x-2"
                            >
                              <div className="font-normal text-[1.125rem]">{item.name}</div>
                              {item.count ? (<div className="text-[0.688rem] font-semibold bg-wri-gold text-black  flex justify-center items-center w-5 h-5 rounded-full pt-1">{item.count}</div>) : ""}
                            </a>
                          </li>
                        )
                      })
                    }
                  </ul>
                </nav>
              </div>
            </Disclosure.Panel>
          </>
        </Disclosure>

        <div className="w-full">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <main className="w-full isolate mb-8">
            <div className=" @container w-full ">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
