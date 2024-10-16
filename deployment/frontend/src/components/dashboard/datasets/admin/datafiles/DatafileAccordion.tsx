import {
    ChevronDownIcon,
    MinusCircleIcon,
    Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { Disclosure, Transition } from '@headlessui/react'
import classNames from '@/utils/classnames'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { SortableKnob } from 'react-easy-sort'
import { useEffect, useState } from 'react'

interface DataFileAccordionProps {
    title: string
    children: React.ReactNode
    icon: React.ReactNode
    className?: string
    preview: React.ReactNode
    id?: string
    remove: () => void
}

export function DataFileAccordion({
    title,
    children,
    icon,
    className,
    preview,
    id = '',
    remove,
}: DataFileAccordionProps) {
    const [canSort, setCanSort] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setCanSort(true)
        }, 3000)
    }, [])

    return (
        <Disclosure
            as="div"
            className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0"
        >
            {({ open }) => (
                <>
                    <div
                        className={classNames(
                            'w-full border-b bg-white shadow',
                            open ? 'border-blue-800' : 'border-zinc-400'
                        )}
                    >
                        <div>
                            <Disclosure.Button
                                id={id ?? ''}
                                as="div"
                                className="sm:px-8 px-4 col-span-full flex w-full justify-between border-b border-stone-50 py-5 datafile-accordion-trigger"
                            >
                                <h3 className="text-black text-xl font-normal font-['Acumin Pro SemiCondensed'] flex items-center gap-x-2">
                                    {title}
                                    <DefaultTooltip content="Remove item">
                                        <button onClick={() => remove()} aria-label='remove'>
                                            <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                        </button>
                                    </DefaultTooltip>{' '}
                                </h3>
                                <div className='flex items-center gap-x-5'>
                                    {canSort && (
                                        <SortableKnob>
                                            <Squares2X2Icon className="w-6 h-6 mt-1 opacity-80 text-wri-gold cursor-move" />
                                        </SortableKnob>
                                    )}
                                    <ChevronDownIcon
                                        className={`${open
                                                ? 'rotate-180 transform  transition'
                                                : ''
                                            } h-5 w-5 text-blue-800`}
                                    />
                                </div>
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
                                    className={classNames(
                                        'py-5',
                                        className ?? ''
                                    )}
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
    )
}
