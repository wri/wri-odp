import {
  Bars4Icon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/_shared/SimpleInput";
import { InputGroup } from "@/components/_shared/InputGroup";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SimpleEditor } from "@/components/_shared/RTE/SimpleEditor";

export function DescriptionForm() {
  return (
    <Disclosure
      as="div"
      className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0"
    >
      {({ open }) => (
        <>
          <div className="w-full border-b border-blue-800 bg-white shadow">
            <div className="px-8">
              <Disclosure.Button className="col-span-full flex w-full justify-between border-b border-stone-50 py-5">
                <h3 className="flex w-full items-center gap-x-2 font-acumin text-xl font-semibold text-blue-800">
                  <Bars4Icon className="h-7 w-7" />
                  Description
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
                <Disclosure.Panel className="flex flex-col gap-y-8 pt-5 pb-12">
                  <InputGroup
                    label="Short Description"
                    className="flex-col items-start whitespace-nowrap mb-2"
                  >
                    <Input
                      placeholder=""
                      name="citation"
                      type="text"
                      as="textarea"
                      className="h-44 w-full max-w-full"
                      maxWidth=""
                    />
                  </InputGroup>
                  <InputGroup
                    label="Full Description"
                    className="flex-col items-start whitespace-nowrap mb-2 h-[350px]"
                  >
                    <SimpleEditor />
                  </InputGroup>
                </Disclosure.Panel>
              </Transition>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}