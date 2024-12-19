import Image from 'next/image'
import { Button } from '../_shared/Button'
import { EnvelopeIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { SubscribeForm } from '../_shared/SubscribeForm'
import { env } from '@/env.mjs'
import osanoListeners from '../_shared/OsanoListeners'

export function HomeFooter() {
    osanoListeners()

    return (
        <>
            <section className="bg-green-700">
                <div className="default-home-container mx-auto md:flex justify-between py-12">
                    <div className="flex flex-col gap-y-1">
                        <h4 className="font-acumin text-[1.625rem] leading-[1.875rem] font-bold text-white">
                            Explore datasets by Team and Topic
                        </h4>
                        <h5 className="font-acumin text-xl font-normal text-gray-100 leading-[1.875rem]">
                            Discover datasets associated with WRI Teams or
                            relevant Topics
                        </h5>
                    </div>
                    <div className="flex gap-x-4">
                        <Link href="/teams">
                            <Button className="mt-10 md:mt-0">
                                Explore Teams
                            </Button>
                        </Link>
                        <Link href="/topics">
                            <Button className="mt-10 md:mt-0">
                                Explore Topics
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
            <div className="default-home-container mx-auto flex w-full flex-col pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 items-center gap-y-8 pt-16 font-bold text-wri-black sm:flex-row sm:items-start leading-[19.2px]">
                    <div className="mb-6 flex w-full flex-col items-center gap-y-4 sm:mb-0 sm:items-start">
                        <p className="text-base font-bold">ABOUT WRI</p>
                        <a
                            href="https://www.wri.org/about"
                            className=" font-normal"
                        >
                            About Us
                        </a>
                        <a
                            href="https://www.wri.org/our-work"
                            target="_blank"
                            className=" font-normal"
                        >
                            Our Work
                        </a>
                        <a
                            href="https://www.wri.org/our-approach"
                            target="_blank"
                            className=" font-normal"
                        >
                            Our Approach
                        </a>
                        <Link
                            href={
                                env.NEXT_PUBLIC_WRI_PRIVACY_POLICY_URL ||
                                'https://www.wri.org/about/privacy-policy?sitename=WRI%20Data%20Explorer&osanoid=c2a89d08-4931-4ad0-99cb-8d3aa022aaec'
                            }
                            className=" font-normal"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                    <div className="mb-6 flex w-full flex-col items-center gap-y-4  sm:mb-0 sm:items-start">
                        <p className="text-base font-bold">USEFUL LINKS</p>
                        <Link href="/" className=" font-normal">
                            Home
                        </Link>
                        <Link href="/teams" className=" font-normal">
                            Teams
                        </Link>
                        <Link href="/topics" className=" font-normal">
                            Topics
                        </Link>
                        <Link href="/applications" className=" font-normal">
                            Applications
                        </Link>
                    </div>
                    <div className="flex w-full flex-col items-center gap-y-4 sm:items-start">
                        <p className="text-base font-bold">GET STARTED</p>
                        <Link href="/search" className=" font-normal">
                            Find Data
                        </Link>
                        <Link href="/user-guide" className=" font-normal">
                            User Guide
                        </Link>
                        <a
                            className="osano-cookie-preference-link font-normal cursor-pointer"
                            title="Manage privacy and cookie preferences"
                        >
                            Cookie Preferences
                        </a>
                    </div>
                    <div className="ml-auto mt-10 lg:col-span-2 lg:w-[90%] flex w-full shrink flex-col items-center gap-y-4 sm:mt-0 sm:items-start xl:min-w-[420px]">
                        <div className="font-acumin text-xl font-bold text-gray-800">
                            STAY UP TO DATE WITH THE NEWS{' '}
                        </div>
                        <SubscribeForm />
                        <div className="flex flex-row gap-5 mt-10 sm:mt-0">
                            <a
                                href="https://facebook.com/worldresources"
                                className="relative h-5 w-5 "
                                aria-label="Facebook"
                            >
                                <Image src="/icons/fb.svg" alt="" fill />
                            </a>
                            <a
                                href="https://twitter.com/WorldResources"
                                className="relative h-5 w-5 "
                                aria-label="Twitter"
                            >
                                <Image src="/icons/x.svg" alt={''} fill />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/world-resources-institute"
                                className="relative h-5 w-5 "
                                aria-label="LinkedIn"
                            >
                                <Image
                                    src="/icons/linkedin.svg"
                                    alt={''}
                                    fill
                                />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="items mx-auto flex w-full flex-col gap-y-8 pt-16 sm:flex-row sm:gap-y-4">
                    <div className=" relative mx-auto h-16 w-52 sm:ml-0 sm:h-20 sm:w-56">
                        <Image
                            src="/images/WRI_logo_4c.webp"
                            priority={false}
                            sizes="(max-width: 638px) 208px, 244px"
                            alt="WRI Logo"
                            fill
                        />
                    </div>
                    <div className="mt-auto flex justify-center md:items-end text-base font-normal md:ml-auto">
                        <div className="flex gap-x-1">
                            <span>
                                Powered by{' '}
                                <a
                                    href="https://www.portaljs.com/"
                                    target="_blank"
                                    className=" text-wri-green"
                                    aria-label="Portal.js website"
                                >
                                    Portal.js
                                </a>{' '}
                                from
                            </span>
                            <div className=" relative h-6 w-24">
                                <a
                                    href="https://www.datopian.com/"
                                    target="_blank"
                                    aria-label="Datopian website"
                                >
                                    <Image
                                        src="/images/datopian.png"
                                        alt=""
                                        sizes="96px"
                                        fill
                                    ></Image>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
