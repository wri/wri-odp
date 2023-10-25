import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

interface Option {
  value: string;
  label: string;
}

export default function Facet({
  text,
  options,
}: {
  text: string;
  options: Option[];
}) {
  return (
    <Disclosure as="div" className="border-b border-r border-stone-200 shadow">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
            <div className="flex h-16 w-full items-center gap-x-2">
              <p className="font-['Acumin Pro SemiCondensed'] text-base font-normal text-black">
                {text}
              </p>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 p-1 text-xs font-normal text-black">
                2
              </span>
            </div>
            <ChevronDownIcon
              className={`${
                open ? "rotate-180 transform  transition" : ""
              } h-5 w-5 text-purple-500`}
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
            <Disclosure.Panel className="border-t-2 border-amber-400 bg-white px-7 pb-2 text-sm text-gray-500">
              <fieldset>
                <div className="mt-2">
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className="relative flex items-start py-1"
                    >
                      <div className="mr-3 flex h-6 items-center">
                        <input
                          id={`person-${option.value}`}
                          name={`person-${option.value}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-sm leading-6">
                        <label
                          htmlFor={`option-${option.value}`}
                          className="select-none font-medium text-gray-900"
                        >
                          {option.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
