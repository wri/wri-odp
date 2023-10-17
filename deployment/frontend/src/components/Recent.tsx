import Card from "./Card";
import Carousel from './Carousel';
import { SwiperSlide } from 'swiper/react';
import CarouselNavButton from './_shared/CarouselNavButton';
import React from 'react'
const recents = [
  {
    title: "Title of the dataset goes here lorem ipsum.",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.",
    date: "2020 - 2023",
    location: "Sub-regional",
    tag: "FORESTS",
    img: "/images/map.png"
  },
  {
    title: "Title of the dataset goes here lorem ipsum.",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.",
    date: "2020 - 2023",
    location: "Sub-regional",
    tag: "FORESTS",
    img: "/images/map1.png"
  },
  {
    title: "Title of the dataset goes here lorem ipsum.",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.",
    date: "2020 - 2023",
    location: "Sub-regional",
    tag: "FORESTS",
    img: "/images/map2.png"
  },
  {
    title: "Title of the dataset goes here lorem ipsum.",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.",
    date: "2020 - 2023",
    location: "Sub-regional",
    tag: "FORESTS",
    img: "/images/map3.png"
  },
  {
    title: "Title of the dataset goes here lorem ipsum.",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.",
    date: "2020 - 2023",
    location: "Sub-regional",
    tag: "FORESTS",
    img: "/images/map.png"
  },
  {
    title: "Title of the dataset goes here lorem ipsum.",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.",
    date: "2020 - 2023",
    location: "Sub-regional",
    tag: "FORESTS",
    img: "/images/map1.png"
  },
  {
    title: "Title of the dataset goes here lorem ipsum.",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.",
    date: "2020 - 2023",
    location: "Sub-regional",
    tag: "FORESTS",
    img: "/images/map2.png"
  },
  {
    title: "Title of the dataset goes here lorem ipsum.",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.",
    date: "2020 - 2023",
    location: "Sub-regional",
    tag: "FORESTS",
    img: "/images/map3.png"
  }
]

export default function Recent({ title }: { title: string }) {
  const identifier = title.toLowerCase().replace(' ', '-')
  return (
    <section id="highlights" className=' w-[94%] sm:w-[86%] xl:w-[91%] 2xl:w-[93.5%] mx-auto flex flex-col font-acumin gap-y-6 mt-16'>
      <h1 className='font-bold text-[2rem] ml-2'>{title}</h1>
      <div className='relative '>
        <div className='peer'>
          <Carousel identifier={identifier}>
            {
              recents.map((recent, index) => {
                return <SwiperSlide key={index} className=""><Card key={index} /></SwiperSlide>
              })
            }
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
    </section>
  )
}

