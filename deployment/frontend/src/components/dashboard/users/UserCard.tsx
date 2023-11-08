import React, { useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import RowProfile from '../_shared/RowProfile';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { IRowProfile } from '../_shared/RowProfile';
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';

type IUser = {
  title?: string;
  description?: string;
  orgnumber?: number;
  image_display_url?: string;
  orgs?:
  {
    title?: string;
    capacity?: string;
    image_display_url?: string;
    name?: string;
  }[]
}

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

function TeamProfile({ user }: { user: IRowProfile | IUser }) {

  const UserProfile = user as IUser
  return (
    <div className='flex flex-col sm:flex-row py-3 pl-4 sm:pl-8 gap-x-14 gap-y-6'>
      <RowProfile imgStyle='w-16 h-16 bg-[#F9F9F9] group-hover:bg-white' isPad profile={user as IRowProfile} />
      <div className='font-normal text-base sm:text-[14px] text-wri-black sm:self-center sm:ml-auto sm:mr-[20%] lg:mr-[46%]'>
        {UserProfile?.orgnumber ? `Member of ${UserProfile?.orgnumber} Teams` : "No Teams"}
      </div>
    </div>
  )
}

function SubCardProfile({ user }: { user: IRowProfile | IUser }) {


  const UserProfile = user as IUser
  if (UserProfile?.orgnumber === 0) return (<></>)

  if (UserProfile?.orgs?.length) console.log("LENGTH: ", UserProfile?.orgs)
  return (
    <div className='flex flex-col pt-2'>
      {
        UserProfile?.orgs?.map((team, index) => {
          return (
            <Row
              key={index}
              groupStyle="group/item group-hover/item:visible "
              className={`pr-6 border-b-[1px] border-wri-gray hover:bg-[#DDEAEF]`}
              rowMain={
                <div className='flex flex-col sm:flex-row pl-3 sm:pl-5  gap-x-14 gap-y-4'>
                  <RowProfile imgStyle='w-8 h-8 mt-2' isPad profile={team as IRowProfile} />
                  <div className='font-normal text-[14px] text-wri-black sm:self-center sm:ml-auto sm:mr-[40%] lg:mr-[60%]'>{team.capacity}</div>
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




export default function UserCard() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 2 } })
  const { data, isLoading } = api.user.getAllUsers.useQuery(query)


  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle='px-2 sm:pr-2 sm:pl-12' rightStyle='px-2 sm:pr-6' placeholder='Find a user' setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={data?.count} />} />
      <div className='w-full'>
        {
          isLoading ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> : (
            data?.users.map((user, index) => {
              return (
                <Row
                  key={index}
                  className={`pr-6`}
                  rowMain={<TeamProfile user={user as IUser} />}
                  linkButton={{
                    label: "View user",
                    link: "#",
                  }}
                  controlButtons={[
                    { label: "Edit", color: 'bg-wri-gold hover:bg-yellow-500', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
                    { label: "Delete", color: 'bg-red-600 hover:bg-red-500', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => { } },
                  ]}
                  rowSub={<SubCardProfile user={user} />}
                  isDropDown
                />
              )
            })
          )
        }
      </div>
    </section>
  )
}
