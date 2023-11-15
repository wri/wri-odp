import React from 'react'
import Row from '../_shared/Row'
import RowProfile from '../_shared/RowProfile'
import type { IRowProfile } from '../_shared/RowProfile'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

function Card({ rowProfile }: { rowProfile: IRowProfile }) {

  return (
    <div className='flex gap-x-4 items-center pl-4 sm:pl-6 py-4'>
      <DefaultTooltip content='unread'>
        <div className='w-2 h-2 rounded-full bg-wri-gold my-auto'></div>
      </DefaultTooltip>

      <div className="flex items-center">
        <DefaultTooltip content='mark as read'>
          <input
            id="notificatoin"
            aria-describedby="notifications-checkbox"
            name="notifications"
            type="checkbox"
            className="h-4 w-4  rounded  bg-white "
          />
        </DefaultTooltip>
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
