import Image from 'next/image'
import { Button } from '../_shared/Button'
import { EnvelopeIcon } from '@heroicons/react/20/solid'

export function HomeFooter() {
    return (
        <>
            <section className="bg-green-700">
                <div className="default-home-container mx-auto md:flex justify-between py-12">
                    <div className="flex flex-col gap-y-1">
                        <h4 className="font-acumin text-2xl font-bold text-white">
                            Some CTA here? Lorem ipsum dolor. Etiam porta sem
                            malesuada magna.
                        </h4>
                        <h5 className="font-acumin text-xl font-normal text-gray-100">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                        </h5>
                    </div>
                    <Button className="mt-10 md:mt-0">Read More</Button>
                </div>
            </section>
            <div className="default-home-container mx-auto flex w-full flex-col pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 items-center gap-y-8 pt-16 font-bold text-wri-black sm:flex-row sm:items-start">
                    <div className="mb-6 flex w-full flex-col items-center gap-y-4 sm:mb-0 sm:items-start">
                        <p className="text-base font-bold">ABOUT WRI</p>
                        <a href="/about" className=" font-normal">
                            About us
                        </a>
                        <a href="/our-mission" className=" font-normal">
                            Our Mission
                        </a>
                        <a href="/our-approach" className=" font-normal">
                            Our Approach
                        </a>
                    </div>
                    <div className="mb-6 flex w-full flex-col items-center gap-y-4  sm:mb-0 sm:items-start">
                        <p className="text-base font-bold">USEFUL LINKS</p>
                        <a href="/" className=" font-normal">
                            Home
                        </a>
                        <a href="/teams" className=" font-normal">
                            Teams
                        </a>
                        <a href="/topics" className=" font-normal">
                            Topics
                        </a>
                    </div>
                    <div className="flex w-full flex-col items-center gap-y-4 sm:items-start">
                        <p className="text-base font-bold">GET STARTED</p>
                        <a href="/search" className=" font-normal">
                            Find Data
                        </a>
                        <a href="/publish-data" className=" font-normal">
                            Publish Data
                        </a>
                        <a href="/get-help" className=" font-normal">
                            Get Help
                        </a>
                    </div>
                    <div className="ml-auto mt-10 lg:col-span-2 lg:w-[90%] flex w-full shrink flex-col items-center gap-y-4 sm:mt-0 sm:items-start xl:min-w-[420px]">
                        <div className="font-acumin text-xl font-bold text-gray-800">
                            STAY UP TO DATE WITH THE NEWS{' '}
                        </div>
                        <div className="flex w-full flex-col gap-x-2 gap-y-4 lg:flex-row justify-between">
                            <div className="relative grow">
                                <input
                                    type="text"
                                    aria-label="email"
                                    className="h-11 w-full peer grow rounded border-0 shadow outline-0 ring-0 ring-offset-0 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 "
                                />
                                <div className="absolute pointer-events-none peer-focus:hidden inset-y-0 left-0 flex gap-x-2 items-center pl-3">
                                    <EnvelopeIcon className="h-6 w-5 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        Enter your email
                                    </span>
                                </div>
                            </div>
                            <Button>SUBSCRIBE</Button>
                        </div>
                        <div className="flex flex-row gap-5 mt-10 sm:mt-0">
                            <div className="relative h-5 w-5 ">
                                <Image src="/icons/fb.svg" alt="" fill />
                            </div>
                            <div className="relative h-5 w-5 ">
                                <Image src="/icons/x.svg" alt={''} fill />
                            </div>
                            <div className="relative h-5 w-5 ">
                                <Image
                                    src="/icons/linkedin.svg"
                                    alt={''}
                                    fill
                                />
                            </div>
                            <div className="relative h-5 w-5 ">
                                <Image src="/icons/mail.svg" alt={''} fill />
                            </div>
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
                                <a href="#" className=" text-wri-green">
                                    Portal.js
                                </a>{' '}
                                from
                            </span>
                            <div className=" relative h-6 w-24">
                                <Image
                                    src="/images/datopian.png"
                                    alt=""
                                    fill
                                    sizes="96px"
                                ></Image>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
