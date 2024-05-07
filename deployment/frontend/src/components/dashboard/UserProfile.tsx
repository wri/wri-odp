import React from 'react'
import Image from 'next/image'
import { api } from '@/utils/api'
import Spinner from '../_shared/Spinner'

export default function UserProfile() {
    const { data, isLoading } = api.user.getDashboardUser.useQuery()
    if (isLoading)
        return (
            <div className="w-full flex flex-col justify-center items-center font-acumin gap-y-2 text-white pb-6 pt-10">
                <Spinner />
            </div>
        )

    return (
        <div className="w-full flex flex-col justify-center items-center font-acumin gap-y-2 text-white pb-6 pt-10">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
                {data?.userdetails?.imageUrl ? (
                    <Image
                        src={`${
                            data?.userdetails?.imageUrl
                                ? data?.userdetails?.imageUrl
                                : '/images/placeholders/user/userdefault.png'
                        }`}
                        fill
                        className=" object-cover"
                        alt=""
                    />
                ) : (
                    <Image
                        src={`https://gravatar.com/avatar/${data?.userdetails?.email_hash}?s=270&d=identicon`}
                        alt="Gravatar"
                        fill
                    />
                )}
            </div>
            <div className="text-[1.438rem] leading-[1.725rem] font-semibold ">
                {data?.userdetails?.name}
            </div>
            <div className="font-normal text-base ">
                {data?.userdetails?.isSysAdmin ? 'System Admin' : 'Member'}
            </div>
            <div className=" text-base  font-light">
                <span className=" mr-2">
                    {data?.userdetails?.teamCount} Teams
                </span>
                <span className="w-0 h-4 border"></span>
                <span className="ml-2">
                    {data?.userdetails?.datasetCount} Datasets
                </span>
            </div>
        </div>
    )
}
