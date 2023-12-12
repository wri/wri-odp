import classNames from "@/utils/classnames"
import { Disclosure, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"

export function Accordion({
    text,
    children,
    className,
}: {
    text: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <Disclosure
            as="div"
            className={classNames(
                'border-b border-r border-stone-200 shadow',
                className ?? ''
            )}
        >
            {({ open }) => (
                <>
                    <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
                        <div className="flex h-16 w-full items-center gap-x-2">
                            {text}
                        </div>
                        <ChevronDownIcon
                            className={`${
                                open ? 'rotate-180 transform  transition' : ''
                            } h-5 w-5 text-black`}
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
                        <Disclosure.Panel className="border-t-2 border-amber-400 bg-white p-4 text-sm text-gray-500">
                            {children}
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}

