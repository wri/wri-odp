import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Disclosure, Transition } from "@headlessui/react";
import classNames from "@/utils/classnames";

interface DataFileAccordionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  preview: React.ReactNode;
}

export function DataFileAccordion({
  title,
  children,
  icon,
  className,
  preview,
}: DataFileAccordionProps) {
  return (
    <Disclosure
      as="div"
      className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0"
      defaultOpen
    >
      {({ open }) => (
        <>
          <div
            className={classNames(
              "w-full border-b bg-white shadow",
              open ? "border-blue-800" : "border-zinc-400",
            )}
          >
            <div className="px-4 sm:px-8">
              <Disclosure.Button className="col-span-full flex w-full justify-between border-b border-stone-50 py-5">
                <h3 className="text-black text-xl font-normal font-['Acumin Pro SemiCondensed']">{title}</h3>
                <ChevronDownIcon
                  className={`${
                    open ? "rotate-180 transform  transition" : ""
                  } h-5 w-5 text-blue-800`}
                />
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel
                  className={classNames("py-5", className ?? "")}
                >
                  {children}
                </Disclosure.Panel>
              </Transition>
            </div>
            {!open && <>{preview}</>}
          </div>
        </>
      )}
    </Disclosure>
  );
}
