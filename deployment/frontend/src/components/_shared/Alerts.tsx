import { XCircleIcon } from '@heroicons/react/20/solid'
import {
    ClipboardIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import DefaultTooltip from './Tooltip'
import classNames from '@/utils/classnames'
import notify from '@/utils/notify'
import { useState } from 'react'

export function ErrorAlert({
    text,
    title = 'There was an error',
}: {
    text: string | React.ReactNode
    title?: string
}) {
    return (
        <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <XCircleIcon
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                    />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                        {title}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>{text}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function InfoAlert({
    text,
    title = 'There was an error',
    copy = false,
    close = false,
}: {
    text: string | React.ReactNode
    title?: string
    copy?: boolean
    close?: boolean
}) {
    const [closed, setClosed] = useState(false)
    const copyTextToClipboard = async (text: string) => {
        if (document !== undefined) {
            if ('clipboard' in navigator) {
                await navigator.clipboard.writeText(text)
                notify(`Copied text to clipboard`, 'success')
            } else {
                return document.execCommand('copy', true, text)
            }
        }
    }
    if (closed) return <></>
    return (
        <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <InformationCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                    />
                </div>
                <div className="ml-3">
                    <div>
                        <h3 className="text-sm font-medium text-green-800">
                            {title}
                        </h3>
                        <div className="mt-2 text-sm text-green-700 flex">
                            <span
                                className={classNames(
                                    'inline',
                                    copy ? 'break-all' : ''
                                )}
                            >
                                {text}
                                {copy && typeof text === 'string' && (
                                    <DefaultTooltip content="Copy to clipboard">
                                        <ClipboardIcon
                                            id="copyButton"
                                            onClick={() =>
                                                copyTextToClipboard(text)
                                            }
                                            className="ml-1 inline cursor-pointer text-green-900 w-5 h-5"
                                        />
                                    </DefaultTooltip>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
                {close && (
                    <DefaultTooltip content="Close">
                        <XCircleIcon
                            onClick={() => setClosed(true)}
                            className="ml-1 flex-shrink-0 cursor-pointer text-green-900 w-5 h-5"
                        />
                    </DefaultTooltip>
                )}
            </div>
        </div>
    )
}
