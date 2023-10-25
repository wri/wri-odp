import React from 'react'
import Image from 'next/image'

export interface SubtopicProps {
  title: string,
  numOfDatasets: number,
  img: string
}

export default function SubtopicCard({ subtopic }: { subtopic: SubtopicProps }) {
  return (
    <div className='flex flex-col w-full font-acumin gap-1'>
      <div className='relative w-full md:w-56 h-44'>
        <Image src={`${subtopic.img}`} alt="higlight" fill />
      </div>
      <div className="text-black text-lg font-normal">{subtopic.title}</div>
      <div className="text-black text-sm font-normal">{subtopic.numOfDatasets} Datasets</div>
    </div>
  )
}
