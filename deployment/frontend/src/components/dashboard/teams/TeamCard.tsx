import React from 'react'
import SearchHeader from '../_shared/SearchHeader'
import RowProfile from '../_shared/RowProfile';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { IRowProfile } from '../_shared/RowProfile';

const teams = [
  {
    title: "Land and Carbon",
    image: "/images/placeholders/teams/lc.png",
    num_datasets: 32,
    description: '23 Members | 32 Datasets'
  },
  {
    title: "International Offices",
    image: "/images/placeholders/teams/io.png",
    num_datasets: 32,
    description: '23 Members | 32 Datasets'
  },
  {
    title: "Global Offices",
    image: "/images/placeholders/teams/go.png",
    description: '23 Members | 32 Datasets'
  },
  {
    title: "Land and Carbon",
    image: "/images/placeholders/teams/lc.png",
    num_datasets: 32,
    description: '23 Members | 32 Datasets'
  },
  {
    title: "International Offices",
    image: "/images/placeholders/teams/io.png",
    num_datasets: 32,
    description: '23 Members | 32 Datasets'
  },
  {
    title: "Global Offices",
    image: "/images/placeholders/teams/go.png",
    description: '23 Members | 32 Datasets'
  }

];

function TeamProfile({ team }: { team: IRowProfile }) {

  return (
    <div className='flex py-3 pl-4 sm:pl-8'>
      <RowProfile imgStyle='w-16 h-16 bg-[#F9F9F9] group-hover:bg-white' isPad profile={team} />
    </div>
  )
}




export default function TeamCard() {
  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-4 sm:gap-y-0'>
      <SearchHeader leftStyle=' px-2 sm:pr-2 sm:pl-12' rightStyle='pr-2 sm:pr-6' />
      {
        teams.map((team, index) => {
          return (
            <Row
              key={index}
              className={`pr-2`}
              rowMain={<TeamProfile team={team} />}
              linkButton={{
                label: "View team",
                link: "#",
              }}
              controlButtons={[
                { label: "Edit", color: 'bg-wri-gold hover:bg-yellow-400', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
                { label: "Delete", color: 'bg-red-600 hover:bg-red-500', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => { } },
              ]}
            />
          )
        })
      }
    </section>
  )
}