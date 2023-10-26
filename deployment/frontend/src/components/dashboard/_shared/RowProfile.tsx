import React from 'react'
import Image from 'next/image'


interface IRowProfile {
  title?: string;
  description?: string;
  image?: string;
}


export default function RowProfile({ imgStyle, isPad, profile }: { imgStyle?: string, isPad?: boolean, profile?: IRowProfile }) {
  return (
    <div className='flex flex-col sm:flex-row gap-x-4 hover:bg-slate-100 p-1 mb-2 pb-2 rounded-md'>
      <div className='flex gap-x-4'>
        <div className={`relative ${imgStyle ? imgStyle : "w-10 h-10"} `}>
          <Image src={profile?.image ? profile.image : '/images/placeholders/user/userpics.png'} alt='' fill />
        </div>
      </div>
      <div className={`flex flex-col ${isPad ? "py-3" : ''}`}>
        <p className='font-normal text-base'>{profile?.title ? profile.title : "sent you a request for approval"}</p>
        {profile?.description ? (<span className='text-[#666666] font-tight text-[12px] '>{profile.description}</span>) : ""}
      </div>
    </div>
  )
}

