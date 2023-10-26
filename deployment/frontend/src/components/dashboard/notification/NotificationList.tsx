import React from 'react'
import NotificationHeader from './NotificationHeader'
import NotificationCard from './NotificationCard'

const notifications = [
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  },
  {
    title: 'Someone sent you a request for approval',
    description: '1 hour ago',
    check: true
  }
]

export default function NotificationList() {
  return (
    <section id="notifications" className='max-w-8xl w-full'>
      <NotificationHeader />
      <div className=' w-full'>
        {
          notifications.map((notification, index) => {
            return (
              <NotificationCard key={index} rowProfile={notification} />
            )
          })
        }
      </div>

    </section>
  )
}
