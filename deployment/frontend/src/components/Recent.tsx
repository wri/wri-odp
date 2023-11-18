import Card from './Card'
import Carousel from './Carousel'
import { SwiperSlide } from 'swiper/react'
import CarouselNavButton from './_shared/CarouselNavButton'
import React from 'react'
import Link from 'next/link'
import { WriDataset } from '@/schema/ckan.schema'

export default function Recent({
    title,
    datasets,
}: {
    title: string
    datasets: WriDataset[]
}) {
    const identifier = title.toLowerCase().replace(' ', '-')
    return (
        <div
            id="highlights"
            className=" px-8 xxl:px-0  max-w-8xl mx-auto flex flex-col font-acumin gap-y-6 mt-16"
        >
            <h1 className="font-bold text-[2rem] ml-2">{title}</h1>
            <div className="relative ">
                <div className="peer">
                    <Carousel identifier={identifier}>
                        {datasets?.map((recent, index) => {
                            return (
                                <SwiperSlide key={index} className="">
                                    <Card dataset={recent} key={index} />
                                </SwiperSlide>
                            )
                        })}
                    </Carousel>
                </div>
                <div
                    className={`transition-all opacity-0 peer-hover:opacity-100 hover:opacity-100 absolute hidden lg:block top-[50%] -translate-y-2/4 ml-[-1.9rem] md:left-0 z-50 nav-prev-button--${identifier}`}
                >
                    <CarouselNavButton orientation="left" />
                </div>
                <div
                    className={`transition-all opacity-0 peer-hover:opacity-100 hover:opacity-100 absolute hidden lg:block top-[50%] -translate-y-2/4 mr-[-1.9rem] md:right-0 z-50 nav-next-button--${identifier}`}
                >
                    <CarouselNavButton orientation="right" />
                </div>
            </div>
        </div>
    )
}
