import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Login from '../_shared/Login'
import { useSession } from 'next-auth/react'
import UserMenu from '../_shared/UserMenu'

export function Hero() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const session = useSession()

    const { asPath } = useRouter()
    const navigation = [
        {
            title: 'Search',
            href: '/search',
            active: false,
        },
        {
            title: 'Teams',
            href: '/teams',
            active: false,
        },
        {
            title: 'Topics',
            href: '/topics',
            active: false,
        },
        {
            title: 'About',
            href: '/about',
            active: false,
        },
    ]
    navigation.forEach((item) => {
        item.active = asPath.startsWith(item.href)
    })

    return (
        <div className="bg-gray-900">
            <header className="absolute inset-x-0 top-0 z-50">
                <nav
                    className="flex items-center justify-between p-6 lg:px-8"
                    aria-label="Global"
                >
                    <div className="flex lg:flex-1">
                        <Link href="/" className=" h-fit w-fit sm:w-52">
                            <Image
                                src="/images/wri_logo_transparent.svg"
                                alt="Picture of the author"
                                width={400}
                                height={500}
                                className="hidden sm:block"
                            />
                            <Image
                                src="/images/wri_logo_transparent.svg"
                                alt="Picture of the author"
                                width={150}
                                height={300}
                                className="block sm:hidden"
                            />
                        </Link>
                    </div>
                    <div className="flex gap-x-2 lg:hidden">
                        <div>
                            {session.status == 'authenticated' ? (
                                <UserMenu colors="light" />
                            ) : (
                                <button
                                    onClick={() => setIsOpen(true)}
                                    className="px-3 py-2 tracking-wide rounded outline-wri-gold outline-1 outline text-sm font-semibold leading-6 text-white"
                                    id="nav-login-button"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-8 items-center">
                        {navigation.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="text-sm font-semibold leading-6 text-white"
                            >
                                {item.title}
                            </Link>
                        ))}
                        <div>
                            {session.status == 'authenticated' ? (
                                <UserMenu colors="light" />
                            ) : (
                                <button
                                    onClick={() => setIsOpen(true)}
                                    className="px-3 py-2 tracking-wide rounded outline-wri-gold outline-1 outline text-sm font-semibold leading-6 text-white"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </nav>
                <Dialog
                    as="div"
                    className="lg:hidden"
                    open={mobileMenuOpen}
                    onClose={setMobileMenuOpen}
                >
                    <div className="fixed inset-0 z-50" />
                    <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
                        <div className="flex items-center justify-between">
                            <Link href="/" className=" h-fit w-fit sm:w-52">
                                <Image
                                    src="/images/wri_logo_transparent.svg"
                                    alt="Picture of the author"
                                    width={400}
                                    height={500}
                                    className="hidden sm:block"
                                />
                                <Image
                                    src="/images/wri_logo_transparent.svg"
                                    alt="Picture of the author"
                                    width={150}
                                    height={300}
                                    className="block sm:hidden"
                                />
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-gray-400"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/25">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Dialog.Panel>
                </Dialog>
            </header>

            <div className="relative isolate overflow-hidden pt-14">
                <img
                    src="/images/bg_hero_homepage.avif"
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full object-cover"

                />
                <div className="bg-black bg-opacity-50 absolute inset-0 -z-[9] h-full w-full object-cover" />
                <div className="default-home-container mx-auto py-32 sm:py-48 lg:py-56">
                    <div className="text-start">
                        <h1 className="max-w-[592px] font-acumin text-[40px] font-semibold text-white">
                            Welcome to the WRI Open Data Catalog. Neque porro
                            quisquam est qui dolorem...
                        </h1>
                        <p className="font-['Acumin Pro SemiCondensed'] w-[705px] text-[23px] font-light text-neutral-200">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore.
                        </p>
                        <div className="mt-10 flex relative items-start justify-start gap-x-6 w-full max-w-[932px]">
                            <input
                                name="search"
                                placeholder="Search data"
                                className="placeholder:text-white text-white text-xl font-normal font-acumin w-full px-6 h-[66px] bg-white bg-opacity-25 rounded-[3px] border-b-2 border-amber-400"
                            />
                            <MagnifyingGlassIcon className="w-7 h-7 text-white absolute top-[18px] right-4" />
                        </div>
                    </div>
                </div>
            </div>
        
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setIsOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full sm:max-w-xl transform overflow-hidden rounded-md bg-white p-6 sm:px-20 text-left align-middle shadow-xl transition-all z-50">
                                    <Login onSignIn={() => setIsOpen(false)} />
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
