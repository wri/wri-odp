import React from 'react'
import Row from '../_shared/Row'
import RowProfile from '../_shared/RowProfile'
import type { IRowProfile } from '../_shared/RowProfile'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { NotificationType } from '@/schema/notification.schema'
import Image from 'next/image'
import { set } from 'lodash'

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
                    <div className="w-2 h-2 rounded-full bg-wri-gold my-auto"></div>
                </DefaultTooltip>
            ) : (
                <div className="w-2 h-2 rounded-full bg-wri-gold my-auto invisible"></div>
            )}

            <div className="flex items-center">
                <DefaultTooltip content="mark as read">
                    <input
                        id="notificatoin"
                        aria-describedby="notifications-checkbox"
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
                                    className="rounded-md"
                                />
                            ) : (
                                <Image
                                    src={`https://gravatar.com/avatar/${rowProfile?.sender_emailHash}?s=270&d=identicon`}
                                    alt="Gravatar"
                                    fill
                                    className="rounded-md"
                                />
                            )}
                        </div>
                    </div>
                    <div className={`flex flex-col `}>
                        <p className="font-normal text-base">
                            {rowProfile?.sender_name} {rowProfile.activity_type}{' '}
                            {rowProfile?.object_name}
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
        />
    )
}
