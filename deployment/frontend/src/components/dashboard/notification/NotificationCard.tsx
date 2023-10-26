import React from 'react'
import Row from '../_shared/Row'
import RowProfile from '../_shared/RowProfile'
import type { IRowProfile } from '../_shared/RowProfile'

function Card({ rowProfile }: { rowProfile: IRowProfile }) {

  return (
    <div className='flex gap-x-4 items-center sm:pl-4 py-4'>
      <div className='w-2 h-2 rounded-full bg-wri-gold my-auto'></div>
      <div className="flex items-center">
        <input
          id="notificatoin"
          aria-describedby="notifications-checkbox"
          name="notifications"
          type="checkbox"
          className="h-4 w-4  rounded  bg-white "
        />
      </div>
      <div className=' flex items-center'>
        <RowProfile profile={rowProfile} imgStyle='w-8 h-8 mt-2' />
      </div>
    </div>
  )
}

export default function NotificationCard({ rowProfile }: { rowProfile: IRowProfile }) {
  return (
    <Row rowMain={<Card rowProfile={rowProfile} />} />
  )
}
