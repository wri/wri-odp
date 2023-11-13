import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Disclosure, Transition } from "@headlessui/react";
import classNames from "@/utils/classnames";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function Accordion({title, children, icon, className, defaultOpen = false}: AccordionProps) {
  return (
    <Disclosure
      defaultOpen={defaultOpen}
      as="div"
      className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0"
    >
      {({ open }) => (
        <>
          <div className="w-full border-b border-blue-800 bg-white shadow">
            <div className="px-8">
              <Disclosure.Button className="w-full col-span-full flex justify-between border-b border-stone-50 py-5">
                <h3 className="flex w-full items-center gap-x-2 font-acumin text-xl font-semibold text-blue-800">
                  {icon}
                  {title}
                </h3>
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
                <Disclosure.Panel className={classNames("py-5", className ?? "")}>
                  {children}
                </Disclosure.Panel>
              </Transition>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
