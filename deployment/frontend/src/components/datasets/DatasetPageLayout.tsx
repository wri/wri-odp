import classNames from "@/utils/classnames";
import { Breadcrumbs } from "../_shared/Breadcrumbs";
import { Disclosure } from "@headlessui/react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export default function DatasetPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100vh]">
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="absolute left-[calc(50%-3rem)] top-[60vh] z-20 hidden lg:block">
              <div
                className={classNames(
                  "flex h-12 w-12 items-center rounded-full bg-white shadow-lg transition",
                  open ? "" : "-translate-x-[calc(50vw-3rem)]",
                )}
              >
                <ArrowRightIcon
                  className={classNames(
                    "mx-auto h-6 w-6 text-black transition",
                    open ? "rotate-180 transform" : "",
                  )}
                />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel
              as="div"
              className="min-w-1/2 h-full hidden w-1/2 lg:z-10 lg:flex lg:flex-col px-4 sm:px-6 py-4 border-r border-gray-200"
            >
              {children}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
