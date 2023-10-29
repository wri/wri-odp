import {
  ArrowsPointingInIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  FolderPlusIcon,
  MinusCircleIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import { Input } from "../../SimpleInput";
import { Disclosure, Transition } from "@headlessui/react";
import { InputGroup } from "./InputGroup";
import { PlusCircleIcon } from "@heroicons/react/20/solid";

function CustomField() {
  return (
    <div className="flex items-center gap-x-2">
      <div className="grid grow grid-cols-1 items-start gap-x-24 py-5 md:grid-cols-2">
        <InputGroup label="Custom Field">
          <Input placeholder="" name="custom_field" type="text" />
        </InputGroup>
        <InputGroup label="Value">
          <Input placeholder="" name="value" type="text" />
        </InputGroup>
      </div>
      <MinusCircleIcon className="h-5 w-5 text-red-600" />
    </div>
  );
}

export function CustomFieldsForm() {
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
                  <FolderPlusIcon className="h-7 w-7" />
                  Custom Fields
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
                <Disclosure.Panel className="py-5">
                  <CustomField />
                  <CustomField />
                  <CustomField />
                  <div className="flex items-center gap-x-1 justify-end">
                    <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                    <div className="font-['Acumin Pro SemiCondensed'] text-xl font-normal leading-tight text-black">
                      Add a custom field
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
