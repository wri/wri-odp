import classNames from '@/utils/classnames'
import { Disclosure } from '@headlessui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

export default function DatasetPageLayout({
    lhs,
    rhs,
}: {
    lhs: React.ReactNode
    rhs: React.ReactNode
}) {
    const { query } = useRouter()
    const isApprovalRequest = query?.approval === 'true'
    const [lhsOpen, setLhsOpen] = useState(true)
    const [rhsOpen, setRhsOpen] = useState(true)
    const [lhsMaxHeight, setLhsMaxHeight] = useState('auto')
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current && ref.current.clientHeight && typeof window !== undefined) {
            const _90vh = document.documentElement.clientHeight * 0.9
            setLhsMaxHeight(`${Math.max(ref.current.clientHeight, _90vh)}px`)
            return
        }
    }, [rhs])

    return (
        <div className="flex flex-wrap lg:flex-nowrap lg:max-w-screen">
            <Disclosure defaultOpen>
                {({ open }) => (
                    <>
                        <Disclosure.Button
                            onClick={() => {
                                setLhsOpen(!open)
                            }}
                            className={classNames(
                                'absolute left-[calc(100%-3rem)] lg:left-[calc(50%-3rem)] top-[23vh] sm:top-[26vh] lg:top-[40vh] z-20 hidden lg:block',
                                rhsOpen && open
                                    ? ''
                                    : !rhsOpen && open
                                    ? '!hidden'
                                    : '',
                                isApprovalRequest ? 'lg:top-[34vh]' : ''
                            )}
                        >
                            <div
                                className={classNames(
                                    `flex h-12 w-12 items-center rounded-full bg-white shadow-lg transition ${
                                        isApprovalRequest
                                            ? 'translate-y-36 xl:translate-y-12'
                                            : ''
                                    }`,
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
                            style={{ maxHeight: lhsMaxHeight }}
                            className="overflow-y-auto overflow-x-hidden min-w-[100%] lg:min-w-[50%] h-full w-full lg:z-10 lg:flex lg:flex-col py-4 border-r border-gray-200 @container"
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
                            className={classNames(
                                'absolute right-[calc(100%-3rem)] lg:right-[calc(50%-3rem)] top-[23vh] sm:top-[26vh] lg:top-[40vh] z-20 hidden lg:block',
                                lhsOpen && open
                                    ? ''
                                    : !lhsOpen && open
                                    ? '!hidden'
                                    : '',
                                isApprovalRequest ? 'lg:top-[34vh]' : ''
                            )}
                        >
                            <div
                                className={classNames(
                                    `flex h-12 w-12 items-center rounded-full bg-white shadow-lg transition ${
                                        isApprovalRequest
                                            ? 'translate-y-36 xl:translate-y-12'
                                            : ''
                                    }`,
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
                            className={`min-w-[100%] lg:min-w-[50%] h-full w-full lg:z-10 lg:flex lg:flex-col border-l border-gray-200 @container`}
                        >
                            <div
                            ref={ref}
                className="w-full overflow-x-hidden">
                                {rhs}
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </div>
    )
}
