import { Fragment, useState } from "react";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { Bars3Icon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Facet from "./Facet";
import LocationSearch from "./LocationSearch";
import classNames from "@/utils/classnames";

export default function FilteredSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white pb-4">
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list">
                            <LocationSearch />
                            <Facet
                              text="Resolution"
                              options={[
                                {
                                  label: "Something",
                                  value: "1m",
                                },
                                {
                                  label: "Lorem Ipsum",
                                  value: "2m",
                                },
                                {
                                  label: "Another thing",
                                  value: "3m",
                                },
                              ]}
                            />
                            <Facet
                              text="Topic"
                              options={[
                                {
                                  label: "2020",
                                  value: "2020",
                                },
                                {
                                  label: "2021",
                                  value: "2021",
                                },
                                {
                                  label: "2022",
                                  value: "2022",
                                },
                              ]}
                            />
                            <Facet
                              text="Team"
                              options={[
                                {
                                  label: "2020",
                                  value: "2020",
                                },
                                {
                                  label: "2021",
                                  value: "2021",
                                },
                                {
                                  label: "2022",
                                  value: "2022",
                                },
                              ]}
                            />
                            <Facet
                              text="Temporal coverage"
                              options={[
                                {
                                  label: "2020",
                                  value: "2020",
                                },
                                {
                                  label: "2021",
                                  value: "2021",
                                },
                                {
                                  label: "2022",
                                  value: "2022",
                                },
                              ]}
                            />
                            <Facet
                              text="License"
                              options={[
                                {
                                  label: "2020",
                                  value: "2020",
                                },
                                {
                                  label: "2021",
                                  value: "2021",
                                },
                                {
                                  label: "2022",
                                  value: "2022",
                                },
                              ]}
                            />
                            <Facet
                              text="Format"
                              options={[
                                {
                                  label: "2020",
                                  value: "2020",
                                },
                                {
                                  label: "2021",
                                  value: "2021",
                                },
                                {
                                  label: "2022",
                                  value: "2022",
                                },
                              ]}
                            />
                            <Facet
                              text="Tags"
                              options={[
                                {
                                  label: "2020",
                                  value: "2020",
                                },
                                {
                                  label: "2021",
                                  value: "2021",
                                },
                                {
                                  label: "2022",
                                  value: "2022",
                                },
                              ]}
                            />
                          </ul>
                        </li>
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
          {({ open }) => (
            <>
              <Disclosure.Button className="absolute lg:block hidden left-[calc(25%-1.5rem)] top-[60vh] z-20">
                <div className={classNames("flex h-12 w-12 items-center rounded-full bg-white shadow-lg transition", open ? "" : "-translate-x-[23.5vw]")}>
                  <ChevronRightIcon
                    className={classNames(
                      "mx-auto h-6 w-6 text-black transition",
                      open ? "rotate-180 transform" : "",
                    )}
                  />
                </div>
              </Disclosure.Button>
              <div className={classNames(open ? "hidden" : "block min-w-[2%] w-[2%]")} />
              <Disclosure.Panel
                as="div"
                className="hidden w-[25%] min-w-[25%] lg:z-10 lg:flex lg:flex-col"
              >
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto pb-4">
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list">
                          <LocationSearch />
                          <Facet
                            text="Resolution"
                            options={[
                              {
                                label: "Something",
                                value: "1m",
                              },
                              {
                                label: "Lorem Ipsum",
                                value: "2m",
                              },
                              {
                                label: "Another thing",
                                value: "3m",
                              },
                            ]}
                          />
                          <Facet
                            text="Topic"
                            options={[
                              {
                                label: "2020",
                                value: "2020",
                              },
                              {
                                label: "2021",
                                value: "2021",
                              },
                              {
                                label: "2022",
                                value: "2022",
                              },
                            ]}
                          />
                          <Facet
                            text="Team"
                            options={[
                              {
                                label: "2020",
                                value: "2020",
                              },
                              {
                                label: "2021",
                                value: "2021",
                              },
                              {
                                label: "2022",
                                value: "2022",
                              },
                            ]}
                          />
                          <Facet
                            text="Temporal coverage"
                            options={[
                              {
                                label: "2020",
                                value: "2020",
                              },
                              {
                                label: "2021",
                                value: "2021",
                              },
                              {
                                label: "2022",
                                value: "2022",
                              },
                            ]}
                          />
                          <Facet
                            text="License"
                            options={[
                              {
                                label: "2020",
                                value: "2020",
                              },
                              {
                                label: "2021",
                                value: "2021",
                              },
                              {
                                label: "2022",
                                value: "2022",
                              },
                            ]}
                          />
                          <Facet
                            text="Format"
                            options={[
                              {
                                label: "2020",
                                value: "2020",
                              },
                              {
                                label: "2021",
                                value: "2021",
                              },
                              {
                                label: "2022",
                                value: "2022",
                              },
                            ]}
                          />
                          <Facet
                            text="Tags"
                            options={[
                              {
                                label: "2020",
                                value: "2020",
                              },
                              {
                                label: "2021",
                                value: "2021",
                              },
                              {
                                label: "2022",
                                value: "2022",
                              },
                            ]}
                          />
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Disclosure.Panel>
            </>
          )}
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

          <main className="w-full">
            <div className="px-4 sm:px-6 lg:px-8 @container w-full">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
