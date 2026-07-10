import React, { Fragment, useState } from 'react';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UserMenu from './UserMenu';
import { useSession } from 'next-auth/react';
import { api } from '@/utils/api';
import LoginModal from './LoginModal';

export default function Header() {
    const { asPath } = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const session = useSession();

    api.auth.getApiTokensList.useQuery(
        {},
        {
            enabled: session.status === 'authenticated',
            staleTime: 5 * 60 * 1000,
        }
    );

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    const navigation = [
        {
            title: 'Search',
            href: '/search',
            active: false,
        },
        {
            title: 'Topics',
            href: '/topics',
            active: false,
        },
        {
            title: 'Teams',
            href: '/teams',
            active: false,
        },
        {
            title: 'Applications',
            href: '/applications',
            active: false,
        },
    ];

    navigation.forEach((item) => {
        if (asPath.includes('?')) {
            item.active = asPath.split('?')[0] === item.href;
        } else {
            item.active = asPath === item.href;
        }
    });

    return (
        <section className="w-full shadow">
            <section
                id="header"
                className="w-full py-10 px-4 sm:px-6 xxl:px-12  mx-auto flex gap-x-1 font-acumin items-baseline"
            >
                <Link href="/" className=" w-fit sm:w-80 h-fit my-auto">
                    <Image
                        src="/images/WRI_logo_4c.png"
                        alt="Picture of the author"
                        width={400}
                        height={500}
                        className="hidden sm:block"
                    />
                    <Image
                        src="/images/WRI_logo_4c.png"
                        alt="Picture of the author"
                        width={120}
                        height={250}
                        className="block sm:hidden"
                    />
                </Link>
                <div className=" ml-auto flex pt-2 my-auto gap-x-6 ">
                    <div className=" hidden sm:flex gap-x-6 font-semibold text-wri-black">
                        {navigation.map((item) => {
                            return (
                                <Link
                                    key={`nav-${item.title}`}
                                    href={item.href}
                                    className={
                                        item.active
                                            ? 'border-b-2 border-b-wri-gold font-acumin'
                                            : ''
                                    }
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>

                    {session.status == 'authenticated' ? (
                        <UserMenu />
                    ) : (
                        <button
                            type="button"
                            onClick={openModal}
                            className="outline-wri-gold outline-1 outline font-bold text-xs tracking-tighter sm:text-base text-black rounded-sm p-2  sm:px-4 sm:py-0 text-center mr-5 sm:mr-0"
                            id="nav-login-button"
                        >
                            Login
                        </button>
                    )}

                    <LoginModal isOpen={isOpen} closeModal={closeModal} />

                    <div className="text-right -ml-6 sm:hidden">
                        <Menu as="div" className="relative inline-block text-left mt-1 pr-1">
                            <div>
                                <Menu.Button>
                                    <Bars3Icon className="text-black h-5 w-5" />
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
                                <Menu.Items className="absolute z-30 right-0 mt-2 whitespace-nowrap p-2 origin-top-right divide-y divide-gray-100 rounded-sm bg-white shadow-lg text-base font-medium focus:outline-none">
                                    {navigation.map((item) => {
                                        return (
                                            <div className="px-1 py-1" key={`nav-${item.title}`}>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            className={`${active && 'bg-blue-500'}`}
                                                            href={item.href}
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        );
                                    })}
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </section>
        </section>
    );
}
