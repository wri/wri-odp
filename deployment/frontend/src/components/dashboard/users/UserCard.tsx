import React from 'react'
import SearchHeader from '../_shared/SearchHeader'
import RowProfile from '../_shared/RowProfile';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { IRowProfile } from '../_shared/RowProfile';

const teams = [
  {
    title: "John Doe",
    image: "/images/placeholders/user/user2.png",
    num_datasets: 32,
    description: 'johndoe@wri.org',
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
    title: "John Doe",
    image: "/images/placeholders/user/user5.png",
    num_datasets: 32,
    description: 'johndoe@wri.org'
  },
  {
    title: "John Doe",
    image: "/images/placeholders/user/user4.png",
    description: 'johndoe@wri.org'
  },
  {
    title: "John Doe",
    image: "/images/placeholders/user/user3.png",
    num_datasets: 32,
    description: 'johndoe@wri.org'
  },
  {
    title: "John Doe",
    image: "/images/placeholders/user/user5.png",
    num_datasets: 32,
    description: 'johndoe@wri.org'
  },
  {
    title: "John Doe",
    image: "/images/placeholders/user/user4.png",
    description: 'johndoe@wri.org'
  }

];

function TeamProfile({ team }: { team: IRowProfile }) {

  return (
    <div className='flex flex-col sm:flex-row py-3 pl-4 sm:pl-8 gap-x-14 gap-y-6'>
      <RowProfile imgStyle='w-16 h-16 bg-[#F9F9F9] group-hover:bg-white' isPad profile={team} />
      <div className='font-normal text-base sm:text-[14px] text-wri-black sm:self-center sm:ml-auto sm:mr-[20%] lg:mr-[46%]'>Members of 2 teams</div>
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
                <div className='flex flex-col sm:flex-row pl-3 sm:pl-5  gap-x-14 gap-y-4'>
                  <RowProfile imgStyle='w-8 h-8 mt-2' isPad profile={team} />
                  <div className='font-normal text-[14px] text-wri-black sm:self-center sm:ml-auto sm:mr-[40%] lg:mr-[60%]'>Team Editor</div>
                </div>
              }
              controlButtons={[
                { label: "Edit", color: 'bg-wri-gold', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
                { label: "Delete", color: 'bg-red-600', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => { } },
              ]}
            />
          )
        })
      }
    </div>
  )
}




export default function UserCard() {
  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle='px-2 sm:pr-2 sm:pl-12' rightStyle='px-2 sm:pr-6' placeholder='Find a user' />
      <div className='w-full'>
        {
          teams.map((team, index) => {
            return (
              <Row
                key={index}
                className={`pr-6`}
                rowMain={<TeamProfile team={team} />}
                linkButton={{
                  label: "View user",
                  link: "#",
                }}
                controlButtons={[
                  { label: "Edit", color: 'bg-wri-gold', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
                  { label: "Delete", color: 'bg-red-600', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => { } },
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
