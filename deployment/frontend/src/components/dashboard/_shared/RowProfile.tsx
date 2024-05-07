import React from 'react'
import Image from 'next/image'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

export interface IRowProfile {
    title?: string
    description?: string
    image?: string
    image_display_url?: string
    name?: string
}

export default function RowProfile({
    imgStyle,
    isPad,
    profile,
    defaultImg,
}: {
    defaultImg?: string
    imgStyle?: string
    isPad?: boolean
    profile?: IRowProfile
}) {
    return (
        <div className="flex flex-row gap-x-4 hover:bg-slate-100  rounded-md">
            <div className="flex gap-x-4">
                <div
                    className={`relative rounded-md ${
                        imgStyle ? imgStyle : 'w-10 h-10'
                    } `}
                >
                    <Image
                        src={
                            profile?.image_display_url
                                ? profile.image_display_url
                                : defaultImg ??
                                  '/images/placeholders/user/userdefault.png'
                        }
                        alt=""
                        className="rounded-md object-cover"
                        fill
                    />
                </div>
            </div>
            <div className={`flex flex-col ${isPad ? 'py-3' : ''}`}>
                <p className="font-normal text-base">
                    {profile?.title || profile?.name
                        ? profile.title || profile.name
                        : 'sent you a request for approval'}
                </p>
                {profile?.description ? (
                    <span className="text-[#666666] font-tight text-[12px] ">
                        {profile.description}
                    </span>
                ) : (
                    ''
                )}
            </div>
        </div>
    )
}

export function RowProfilev2({
    imgStyle,
    isPad,
    profile,
    defaultImg,
}: {
    defaultImg?: string
    imgStyle?: string
    isPad?: boolean
    profile?: IRowProfile
}) {
    return (
        <div className="flex flex-row gap-x-4 hover:bg-slate-100  rounded-md">
            <div className="flex gap-x-4">
                <div
                    className={`relative ${imgStyle ? imgStyle : 'w-10 h-10'} `}
                >
                    <Image
                        src={
                            profile?.image_display_url
                                ? profile.image_display_url
                                : defaultImg ??
                                  '/images/placeholders/user/userdefault.png'
                        }
                        alt=""
                        className="rounded-md"
                        fill
                    />
                </div>
            </div>
            <div className={`flex flex-col ${isPad ? 'py-3' : ''}`}>
                <DefaultTooltip content={profile?.name}>
                    <p className="font-normal text-base  line-clamp-1 max-w-24">
                        {profile?.title || profile?.name
                            ? profile.title || profile.name
                            : 'sent you a request for approval'}
                    </p>
                </DefaultTooltip>

                {profile?.description ? (
                    <span className="text-[#666666] font-tight text-[12px] ">
                        {profile.description}
                    </span>
                ) : (
                    ''
                )}
            </div>
        </div>
    )
}
