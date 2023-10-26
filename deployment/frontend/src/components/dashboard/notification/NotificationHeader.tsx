import React, { Fragment } from 'react'
import TableHeader from '../_shared/TableHeader'
import { TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { Menu, Transition } from "@headlessui/react";


function LeftNode() {
  return (
    <div className='relative flex flex-row items-center gap-x-3 w-full pl-4 sm:pl-12'>
      <div className="flex h-6 items-center">
        <input
          id="notificatoin"
          aria-describedby="notifications-checkbox"
          name="notifications"
          type="checkbox"
          className="h-4 w-4  rounded  bg-white "
        />
      </div>
      <div>
        <TrashIcon className="w-4 h-4 text-red-500" />
      </div>
      <div className=''>
        <Menu as="div" className="relative inline-block text-left  pr-1 z-50">
          <div>
            <Menu.Button>
              <div className="h-full mt-2">

                <EllipsisVerticalIcon className="w-4 h-4 text-black" />
              </div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute left-0 w-32 whitespace-nowrap  origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-md text-[14px] font-normal focus:outline-none">
              <div className="hover:bg-slate-100" >
                <div className="px-2 pr-2 py-3 " >
                  <Menu.Item>

                    <div>Mark as read</div>
                  </Menu.Item>
                </div>
              </div>
              <div className="hover:bg-slate-100">
                <div className="px-2 pr-4 py-3 " >
                  <Menu.Item>

                    <div>Mark as unread</div>
                  </Menu.Item>
                </div>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  )
}

export default function NotificationHeader() {
  return (
    <TableHeader leftNode={<LeftNode />} />
  )
}
