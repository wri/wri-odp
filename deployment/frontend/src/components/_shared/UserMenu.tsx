import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/20/solid'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'


export default function UserMenu({
    colors = 'dark',
}: {
    colors?: 'dark' | 'light'
}) {
    const session = useSession()

    const navigation = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            active: false,
        },
        {
            title: 'Settings',
            href: `/dashboard/settings/edit/${session.data?.user.name}`,
            active: false,
        },
        {
            title: 'Log Out',
            onClick: async () => {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_CKAN_URL}/api/3/action/user_logout`, {
                      method: 'POST',
                      body: new URLSearchParams({
                        id: session.data?.user.id as string,
                      }),
                    })
                } catch (error) {
                    console.error('Failed to logout from CKAN backend. The current token will not be revoked until next login.')
                    console.error(error)
                }
                signOut({ redirect: true, callbackUrl: window.location.href });
            },
        },
    ]

    return (
        <div
            className="text-right -ml-6 sm:ml-0 font-acumin"
            id="nav-user-menu"
        >
            <Menu
                as="div"
                className="relative inline-block text-left  pr-1 "
            >
                <div>
                    <Menu.Button>
                        <div className="flex ">
                            <UserCircleIcon
                                className={`text-black h-5 w-5 mr-2 ${
                                    colors == 'light' ? '!text-white' : ''
                                }`}
                            />
                            <div
                                className={`font-normal text-sm sm:text-lg border-b-2 border-b-wri-gold ${
                                    colors == 'light' ? '!text-white' : ''
                                }`}
                            >
                                {session.data?.user.name}
                            </div>
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
                    <Menu.Items className="absolute z-30 right-0 mt-2 w-52 whitespace-nowrap  origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-md text-base font-semibold focus:outline-none">
                        {navigation.map((item) => {
                            return (
                                <div
                                    className="hover:bg-slate-100 rounded-md"
                                    key={`nav-${item.title}`}
                                >
                                    <div className="px-2 pr-4 py-4 ">
                                        <Menu.Item>
                                            {item.onClick ? (
                                                <button onClick={item.onClick}>
                                                    {item.title}
                                                </button>
                                            ) : (
                                                <Link href={item.href}>
                                                    {item.title}
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </div>
                            )
                        })}
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    )
}
