import {
  ArrowsPointingInIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import { Input } from "../../SimpleInput";
import { Disclosure, Transition } from "@headlessui/react";
import { InputGroup } from "./InputGroup";

export function MoreDetailsForm() {
  return (
    <Disclosure
      as="div"
      className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0"
    >
      {({ open }) => (
        <>
          <div className="w-full border-b border-blue-800 bg-white shadow">
            <div className="px-8">
              <Disclosure.Button className="w-full col-span-full flex justify-between border-b border-stone-50 py-5">
                <h3 className="flex w-full items-center gap-x-2 font-acumin text-xl font-semibold text-blue-800">
                  <SquaresPlusIcon className="h-7 w-7" />
                  More Details
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
                <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-24 py-5 md:grid-cols-2">
                  <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Function" className="items-start">
                      <Input
                        placeholder="This data serves X porpuse"
                        name="function"
                        type="text"
                        as="textarea"
                        className="h-28"
                      />
                    </InputGroup>
                    <InputGroup label="Restrictions" className="items-start">
                      <Input
                        placeholder="Data can only be used without alteration"
                        name="restrictions"
                        type="text"
                        as="textarea"
                        className="h-28"
                      />
                    </InputGroup>
                    <InputGroup label="Reason for adding" className="items-start">
                      <Input
                        placeholder="Due to new funding for research"
                        name="reason_for_adding"
                        type="text"
                        as="textarea"
                        className="h-28"
                      />
                    </InputGroup>
                    <InputGroup label="Learn more" className="items-start">
                      <Input
                        placeholder="Please visit our website for more information: LINK TO WEBSITE"
                        name="learn_more"
                        type="text"
                        as="textarea"
                        className="h-28"
                      />
                    </InputGroup>
                  </div>
                  <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Cautions" className="items-start">
                      <Input
                        placeholder=""
                        name="cautions"
                        type="text"
                        as="textarea"
                        className="h-64"
                        icon={
                          <ExclamationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
                        }
                      />
                    </InputGroup>
                    <InputGroup label="Summary" className="items-start">
                      <Input
                        placeholder="My short summary of this data"
                        name="learn_more"
                        type="text"
                        as="textarea"
                        className="h-64"
                      />
                    </InputGroup>
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
