import React from 'react'
import Row from '../_shared/Row'
import { NotificationType } from '@/schema/notification.schema'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const DefaultTooltip = dynamic(() => import('@/components/_shared/Tooltip'), {
    ssr: false,
})
function Card({
    rowProfile,
    selected,
    setSelected,
}: {
    rowProfile: NotificationType
    selected: string[]
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
}) {
    const handleCheckboxChange = (item: string) => {
        if (selected.includes(item)) {
            setSelected(
                selected.filter((selectedItem) => selectedItem !== item)
            )
        } else {
            setSelected([...selected, item])
        }
    }
    return (
        <div className="flex gap-x-4 items-center pl-4 sm:pl-6 py-4">
            {rowProfile?.is_unread ? (
                <DefaultTooltip content="unread">
                    <div
                        className="w-2 h-2 rounded-full bg-wri-gold my-auto"
                        id="unreadn"
                    ></div>
                </DefaultTooltip>
            ) : (
                <div className="w-2 h-2 rounded-full bg-wri-gold my-auto invisible"></div>
            )}

            <div className="flex items-center">
                <DefaultTooltip content="select">
                    <input
                        aria-describedby="notifications-checkbox"
                        aria-label={`select ${rowProfile?.msg}`}
                        name="notifications"
                        type="checkbox"
                        className="h-4 w-4  rounded  bg-white "
                        value={rowProfile.id}
                        checked={selected.includes(rowProfile.id)}
                        onChange={() => handleCheckboxChange(rowProfile.id)}
                    />
                </DefaultTooltip>
            </div>

            <div className=" flex items-center">
                <div className="flex flex-row gap-x-4 hover:bg-slate-100  rounded-md">
                    <div className="flex gap-x-4">
                        <div className={`relative w-8 h-8 mt-2 `}>
                            {rowProfile.sender_image ? (
                                <Image
                                    src={`${rowProfile.sender_image}`}
                                    fill
                                    alt=""
                                    className="rounded-md object-cover"
                                />
                            ) : (
                                <Image
                                    src={`https://gravatar.com/avatar/${rowProfile?.sender_emailHash}?s=270&d=identicon`}
                                    alt="Gravatar"
                                    fill
                                    className="rounded-md object-cover"
                                />
                            )}
                        </div>
                    </div>
                    <div className={`flex flex-col `}>
                        <p className="font-normal text-base ">
                            <Link
                                href={`/dashboard/users?q=${rowProfile?.sender_name}`}
                                className="group-hover:underline"
                            >
                                {rowProfile?.sender_name}{' '}
                            </Link>
                            {rowProfile?.msg}{' '}
                            <Link
                                href={`/${rowProfile?.object_type}s/${rowProfile?.objectIdName}`}
                                className="group-hover:underline"
                            >
                                {rowProfile?.object_name}
                            </Link>
                        </p>
                        {rowProfile.time_sent ? (
                            <span className="text-[#666666] font-tight text-[12px] ">
                                {rowProfile.time_text}
                            </span>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function NotificationCard({
    rowProfile,
    selected,
    setSelected,
}: {
    rowProfile: NotificationType
    selected: string[]
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
}) {
    return (
        <Row
            rowMain={
                <Card
                    rowProfile={rowProfile}
                    selected={selected}
                    setSelected={setSelected}
                />
            }
            className={`${
                selected.includes(rowProfile.id) ? 'bg-slate-100' : ''
            }`}
        />
    )
}
