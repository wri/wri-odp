import React, { useState } from 'react'
import {
    MagnifyingGlassIcon,
    ChatBubbleLeftIcon,
    ClockIcon,
} from '@heroicons/react/24/outline'
import { Issue } from '@/schema/ckan.schema'
import { Disclosure, Transition } from '@headlessui/react'
import { Index } from 'flexsearch'
import classNames from '@/utils/classnames'

export default function Issues({
    issues,
    index,
}: {
    issues: Issue[]
    index: Index
}) {
    const [q, setQ] = useState('')
    const filteredIssues =
        q !== ''
            ? issues?.filter((issue) => index.search(q).includes(issue.id))
            : issues
    return (
        <section id="issues">
            <div className="relative pb-5">
                <input
                    onChange={(e) => setQ(e.target.value)}
                    value={q}
                    className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                    placeholder="Find an issue"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[15px] right-4" />
            </div>
            <div className="flex flex-col gap-x-3 gap-y-3">
                <span className="mb-1">{filteredIssues.length} Issues</span>
                {filteredIssues.map((issue, index) => (
                    <IssueCard key={index} issue={issue} />
                ))}
            </div>
        </section>
    )
}

function IssueCard({ issue }: { issue: Issue }) {
    const created_at = new Date(issue.created ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const
    return (
        <Disclosure
            as="div"
            className={classNames(
                'flex flex-col relative font-acumin gap-y-1 border-b-2 border-wri-green bg-white p-5 shadow-wri transition hover:bg-slate-100',
                issue.comments.length > 0 ? 'cursor-pointer' : ''
            )}
        >
            <Disclosure.Button as="div" disabled={issue.comments.length === 0}>
                <div className="relative">
                    <h3 className="font-semibold text-[1.125rem]">
                        {issue.title}
                    </h3>
                    {issue.comment_count > 0 && (
                        <div className="flex absolute right-8 sm:top-[40%] gap-x-1 items-center">
                            <ChatBubbleLeftIcon className="w-5 h-5 text-blue-800" />
                            <div className=" font-normal text-base">
                                {issue.comment_count}
                            </div>
                        </div>
                    )}
                    <p className="font-light text-base w-full sm:w-[80%] text-[#1A1919]">
                        {issue.description}
                    </p>
                    <div className="flex items-center gap-x-1 ">
                        <ClockIcon className="w-4 h-4 text-blue-800" />
                        <div className=" font-light text-[0.875rem] mt-2">
                            {' '}
                            {created_at.toLocaleDateString('en-US', options)}
                        </div>
                    </div>
                </div>
            </Disclosure.Button>
            <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
            >
                <Disclosure.Panel className="border-t border-gray-400 my-4 pt-4">
                    <p className="font-acumin text-base w-full text-[#1A1919]">
                        Comments
                    </p>
                    {issue.comments.map((comment) => (
                        <li key={comment.id} className="flex gap-x-4 pt-2">
                            <img
                                className="h-12 w-12 flex-none rounded-full bg-gray-50"
                                src={
                                    comment.user.gravatar_url ??
                                    comment.user.image_display_url ??
                                    '/images/placeholders/user/userdefault.png'
                                }
                                alt=""
                            />
                            <div className="flex-auto">
                                <div className="flex items-baseline justify-between gap-x-4">
                                    <p className="text-sm font-semibold leading-6 text-gray-900">
                                        {comment.user.display_name ??
                                            comment.user.name}
                                    </p>
                                    <p className="flex-none text-xs text-gray-600">
                                        <time dateTime={comment.created}>
                                            {new Date(
                                                comment.created
                                            ).toLocaleDateString(
                                                'en-US',
                                                options
                                            )}
                                        </time>
                                    </p>
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600">
                                    {comment.comment}
                                </p>
                            </div>
                        </li>
                    ))}
                </Disclosure.Panel>
            </Transition>
        </Disclosure>
    )
}
