import {
  ArrowsPointingInIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/_shared/SimpleInput";
import { InputGroup } from "@/components/_shared/InputGroup";
import { Disclosure, Transition } from "@headlessui/react";

export function PointOfContactForm() {
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
                  <ChatBubbleLeftRightIcon className="h-7 w-7" />
                  Point of Contact
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
                    <InputGroup label="Author Name" required>
                      <Input
                        name="author_name"
                        placeholder="Example Man"
                        type="text"
                      />
                    </InputGroup>
                    <InputGroup label="Author Email" required>
                      <Input
                        name="author_email"
                        placeholder="Global Forest Watch"
                        type="email"
                      >
                      </Input>
                    </InputGroup>
                  </div>
                  <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Maintainer Name" required>
                      <Input
                        name="maintainer_name"
                        placeholder="Another name"
                        type="text"
                      />
                    </InputGroup>
                    <InputGroup label="Maintainer Email" required>
                      <Input
                        name="maintainer_email"
                        placeholder="anotheremail@gmail.com"
                        type="email"
                      >
                      </Input>
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
