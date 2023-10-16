import Card from "./Card";

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
  }
]

export default function Recent() {
  return (
    <section id="highlights" className='w-[94%] mx-auto flex flex-col font-acumin gap-y-4 mt-8'>
      <h1 className='font-bold text-[2rem]'>Recently Added</h1>
      <div className='grid lg:grid-cols-2 lg:gap-x-8 xl:grid-cols-4 xl:gap-x-10 gap-y-12'>
        {
          recents.map((recent, index) => {
            return <Card key={index} />
          })
        }
      </div>
    </section>
  )
}

