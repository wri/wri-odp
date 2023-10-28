import classNames from "@/utils/classnames";
import { Disclosure } from "@headlessui/react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export default function DatasetPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="absolute left-[calc(100%-3rem)] lg:left-[calc(50%-3rem)] top-[23vh] sm:top-[26vh] lg:top-[30vh] z-20">
              <div
                className={classNames(
                  "flex h-12 w-12 items-center rounded-full bg-white shadow-lg transition",
                  open ? "" : "-translate-x-[calc(100vw-3rem)] lg:-translate-x-[calc(50vw-3rem)]",
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
              className="max-h-[90vh] overflow-y-scroll overflow-x-hidden min-w-[100%] lg:min-w-[50%] h-full w-1/2 lg:z-10 lg:flex lg:flex-col pl-4 sm:pl-6 py-4 border-r border-gray-200 @container"
            >
              {children}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
