import React from 'react'
import SearchHeader from '../_shared/SearchHeader'
import RowProfile from '../_shared/RowProfile';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { IRowProfile } from '../_shared/RowProfile';

const teams = [
  {
    title: "Land and Carbon",
    image: "/images/placeholders/topics/topic7.png",
    num_datasets: 32,
    description: '22 Subtopics',
    subtopic: [
      {
        title: "Land and Carbon",
        image: "/images/placeholders/topics/topic7.png",
      },
      {
        title: "International Offices",
        image: "/images/placeholders/topics/topic8.png",
      },
      {
        title: "Global Offices",
        image: "/images/placeholders/topics/topic1.png",
      },
      {
        title: "Land and Carbon",
        image: "/images/placeholders/topics/topic2.png",
      },
    ]
  },
  {
    title: "International Offices",
    image: "/images/placeholders/topics/topic8.png",
    num_datasets: 32,
    description: '22 Subtopics'
  },
  {
    title: "Global Offices",
    image: "/images/placeholders/topics/topic1.png",
    description: '22 Subtopics'
  },
  {
    title: "Land and Carbon",
    image: "/images/placeholders/topics/topic2.png",
    num_datasets: 32,
    description: '22 Subtopics'
  },
  {
    title: "International Offices",
    image: "/images/placeholders/topics/topic3.png",
    num_datasets: 32,
    description: '22 Subtopics'
  },
  {
    title: "Global Offices",
    image: "/images/placeholders/topics/topic5.png",
    description: '22 Subtopics'
  }

];

function TeamProfile({ team }: { team: IRowProfile }) {

  return (
    <div className='flex py-5 pl-4 sm:pl-8'>
      <RowProfile imgStyle='w-16 h-16 bg-[#F9F9F9] group-hover:bg-white' isPad profile={team} />
    </div>
  )
}

function SubCardProfile({ teams }: { teams: IRowProfile[] | undefined }) {

  if (!teams) return (<></>)
  return (
    <div className='flex flex-col pt-2'>
      {
        teams.map((team, index) => {
          return (
            <Row
              key={index}
              groupStyle="group/item group-hover/item:visible "
              className={`pr-6 border-b-[1px] border-wri-gray hover:bg-[#DDEAEF]`}
              rowMain={
                <div className='flex pl-3 sm:pl-5  '>
                  <RowProfile imgStyle='w-8 h-8 mt-2' isPad profile={team} />
                </div>
              }
              controlButtons={[
                { label: "Edit", color: 'bg-wri-gold hover:bg-yellow-500', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
                { label: "Delete", color: 'bg-red-600 hover:bg-red-500', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => { } },
              ]}
            />
          )
        })
      }
    </div>
  )
}




export default function TopicCard() {

  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle=' sm:pr-2 sm:pl-12' rightStyle=' px-2 sm:pr-6' />
      <div className='w-full'>
        {
          teams.map((team, index) => {
            return (
              <Row
                key={index}
                className={`pr-6`}
                rowMain={<TeamProfile team={team} />}
                linkButton={{
                  label: "View topic",
                  link: "#",
                }}
                controlButtons={[
                  { label: "Edit", color: 'bg-wri-gold hover:bg-yellow-400', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
                  { label: "Delete", color: 'bg-red-600 hover:bg-red-500', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => { } },
                ]}
                rowSub={<SubCardProfile teams={team.subtopic} />}
                isDropDown
              />
            )
          })
        }
      </div>
    </section>
  )
}
