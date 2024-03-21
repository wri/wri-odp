import classNames from '@/utils/classnames'
import { Tab } from '@headlessui/react'
import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from '@heroicons/react/20/solid'
import { Fragment } from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { PlusSmallIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type TabProps = {
    name: string
    title: string
    id?: string
    content: JSX.Element
}

export default function DashboardDatasetTabs({ tabs }: { tabs: TabProps[] }) {
    const prevEl = `.nav-prev-button--tabs`
    const nextEl = `.nav-next-button--tabs`
    return (
        <>
            <Swiper
                className="dataset-tabs flex w-full"
                modules={[Navigation]}
                spaceBetween={0}
                slidesPerView="auto"
                navigation={{
                    prevEl: prevEl,
                    nextEl: nextEl,
                }}
            >
                {tabs.map((tab) => (
                    <SwiperSlide key={tab.name} className=" max-w-8xl">
                        <Tab
                            as="div"
                            key={tab.title}
                            className="text-base font-normal text-black accent-white cursor-pointer"
                        >
                            {({ selected }) => (
                                <div
                                    className={`w-full border-b-2 py-4 font-normal focus:outline-0 ${selected
                                            ? ' border-b-2 border-b-wri-dark-green text-wri-green'
                                            : ''
                                        } `}
                                >
                                    {tab.title === 'Add dataset' ? (
                                        <div className="flex lg:px-12 2xl:px-14 px-6 sm:px-8 ">
                                            <div className="mr-2  mt-[0.2rem] flex h-4 w-4 items-center  justify-center rounded-full bg-wri-gold">
                                                <PlusSmallIcon className="h-3 w-3 text-white" />
                                            </div>
                                            <span>{tab.title}</span>
                                        </div>
                                    ) : (
                                        <span className="text-center px-6 sm:px-8 lg:px-12 2xl:px-14 ">
                                            {tab.title}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Tab>
                    </SwiperSlide>
                ))}
                <SwiperSlide className="max-w-8xl">
                    <Link href="/dashboard/datasets/new" className="text-base font-normal text-black accent-white" role='tab'>
                        <div className="w-full border-b-2 py-4 font-normal focus:outline-0">
                            <div className="flex lg:px-12 2xl:px-14 px-6 sm:px-8 ">
                                <div className="mr-2  mt-[0.2rem] flex h-4 w-4 items-center  justify-center rounded-full bg-wri-gold">
                                    <PlusSmallIcon className="h-3 w-3 text-white" />
                                </div>
                                <span>Add Dataset</span>
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            </Swiper>
            <button className="nav-prev-button--tabs"  aria-label="previous button" role="tab">
                <ChevronDoubleLeftIcon className="h-6 w-6 text-black" />
            </button>
            <button className="nav-next-button--tabs" aria-label="next button" role="tab">
                <ChevronDoubleRightIcon className="h-6 w-6 text-black" />
            </button>
        </>
    )
}
