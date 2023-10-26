import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from '@/utils/classnames';

interface Option {
  id: number;
  label: string;
}

export default function SelectFilter({ options }: { options: Option[] }) {
  const [selected, setSelected] = useState(options[0] ? options[0] : { id: 0, label: '' })

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <div className="relative w-48">
            <Listbox.Button className="relative w-full cursor-default rounded-sm bg-wri-gray py-2 pl-3 pr-8 text-left shadow-sm border-b-wri-gold border-b-2 focus:outline-none  sm:leading-6 text-black text-sm font-normal font-['Acumin Pro SemiCondensed']">
              <span className="block truncate text-wri-black">{selected.label}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="h-4 w-4 text-stone-600" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-wri-green text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 px-4'
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {option.label}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}
