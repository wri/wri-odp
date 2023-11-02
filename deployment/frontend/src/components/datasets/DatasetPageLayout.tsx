import classNames from '@/utils/classnames'
import { Disclosure } from '@headlessui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { useRouter } from "next/router";

export default function DatasetPageLayout({
    lhs,
    rhs,
}: {
    lhs: React.ReactNode
    rhs: React.ReactNode
}) {
    const { query } = useRouter();
    const isApprovalRequest = query?.approval === "true";
    const [lhsOpen, setLhsOpen] = useState(true)
    const [rhsOpen, setRhsOpen] = useState(true)

    console.log(lhsOpen, rhsOpen)

    return (
        <div className="flex flex-wrap lg:flex-nowrap lg:max-w-screen">
            <Disclosure defaultOpen>
                {({ open }) => (
                    <>
                        <Disclosure.Button
                            onClick={() => {
                                setLhsOpen(!open)
                            }}
                            className={`absolute left-[calc(100%-3rem)] lg:left-[calc(50%-3rem)] top-[23vh] sm:top-[26vh] lg:top-[30vh] z-20 hidden lg:block ${
                                rhsOpen && open
                                    ? ''
                                    : !rhsOpen && open
                                    ? '!hidden'
                                    : ''
                            }`}
                        >
                            <div
                                className={classNames(
                                    `flex h-12 w-12 items-center rounded-full bg-white shadow-lg transition ${isApprovalRequest ? "translate-y-36 xl:translate-y-12" : ""}`,
                                    open
                                        ? ''
                                        : '-translate-x-[calc(100vw-3rem)] lg:-translate-x-[calc(50vw-3rem)]'
                                )}
                            >
                                <ChevronRightIcon
                                    className={classNames(
                                        'mx-auto h-6 w-6 text-black transition',
                                        open ? 'rotate-180 transform' : ''
                                    )}
                                />
                            </div>
                        </Disclosure.Button>
                        <Disclosure.Panel
                            as="div"
                            className="lg:max-h-[90vh] overflow-y-scroll overflow-x-hidden min-w-[100%] lg:min-w-[50%] h-full w-full lg:z-10 lg:flex lg:flex-col pl-4 sm:pl-6 py-4 border-r border-gray-200 @container"
                        >
                            {lhs}
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>

            <Disclosure defaultOpen>
                {({ open }) => (
                    <>
                        <Disclosure.Button
                            onClick={() => {
                                setRhsOpen(!open)
                            }}
                            className={`absolute right-[calc(100%-3rem)] lg:right-[calc(50%-3rem)] top-[23vh] sm:top-[26vh] lg:top-[30vh] z-20 hidden lg:block ${
                                lhsOpen && open
                                    ? ''
                                    : !lhsOpen && open
                                    ? '!hidden'
                                    : ''
                            }`}
                        >
                            <div
                                className={classNames(
                                    'flex h-12 w-12 items-center rounded-full bg-white shadow-lg transition',
                                    open
                                        ? ''
                                        : 'translate-x-[calc(100vw-3rem)] lg:translate-x-[calc(50vw-3rem)]'
                                )}
                            >
                                <ChevronLeftIcon
                                    className={classNames(
                                        'mx-auto h-6 w-6 text-black transition',
                                        open ? 'rotate-180 transform' : ''
                                    )}
                                />
                            </div>
                        </Disclosure.Button>
                        <Disclosure.Panel
                            as="div"
                            className={`min-w-[100%] lg:min-w-[50%] h-full w-full lg:z-10 lg:flex lg:flex-col border-r border-gray-200 @container`}
                        >
                            <div className="w-full overflow-x-hidden">
                                {rhs}
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </div>
    )
}
