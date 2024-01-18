'use client'

import { useMemo, useRef, useState } from 'react'

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/_shared/Command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import classNames from '@/utils/classnames'
import {
    CheckIcon,
    ChevronDownIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { match, P } from 'ts-pattern'
import { Button } from '@/components/_shared/Button'
import { TopicHierarchy } from '@/interfaces/topic.interface'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { Controller, UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { Group } from '@portaljs/ckan'

export function TopicsSelect({
    userTopics,
    topicHierarchy,
    formObj,
}: {
    topicHierarchy: TopicHierarchy[]
    userTopics: string[] | null
    formObj: UseFormReturn<DatasetFormType>
}) {
    const { control } = formObj
    return (
        <Controller
            control={control}
            name="topics"
            defaultValue={[]}
            render={({ field: { onChange, value } }) => (
                <TopicsInner
                    userTopics={userTopics}
                    onChange={onChange}
                    value={value}
                    topicHierarchy={topicHierarchy}
                />
            )}
        />
    )
}
export function TopicsInner({
    topicHierarchy,
    onChange,
    value,
    userTopics,
}: {
    topicHierarchy: TopicHierarchy[]
    onChange: (value: string[]) => void
    value: string[]
    userTopics: string[] | null
}) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const ref = useRef<HTMLButtonElement>(null)
    const possiblePaths = useMemo(() => {
        const possiblePaths = new Map()
        function GetPaths(topic: TopicHierarchy, parent?: TopicHierarchy) {
            if (!parent) possiblePaths.set(topic.name, [topic.name])
            else
                possiblePaths.set(topic.name, [
                    ...possiblePaths.get(parent.name),
                    topic.name,
                ])
            topic.children.forEach((child) => GetPaths(child, topic))
        }
        topicHierarchy.forEach((topic) => GetPaths(topic))
        return possiblePaths
    }, [JSON.stringify(topicHierarchy)])

    function FlattenTopic(
        topic: TopicHierarchy
    ): { title: string; name: string }[] {
        return match(topic)
            .with({ name: P.select('name'), children: [] }, () => [
                {
                    title: topic.title,
                    name: topic.name,
                },
            ])
            .with({ name: P.select('name'), children: P.array() }, () => [
                { title: topic.title, name: topic.name },
                ...topic.children.flatMap(FlattenTopic),
            ])
            .otherwise(() => [])
    }

    const flattenedTopicHierarchy = topicHierarchy.flatMap(FlattenTopic)

    const filteredTopics =
        query.length === 0
            ? flattenedTopicHierarchy
            : flattenedTopicHierarchy
                  .map((item) => {
                      const included = item.title
                          .toLowerCase()
                          .includes(query.toLowerCase())
                      return included ? possiblePaths.get(item.name) : []
                  })
                  .flat()

    function BuildHierarchy(
        topic: TopicHierarchy,
        level: number
    ): React.ReactNode {
        const paddingLeft = match(level)
            .with(0, () => '')
            .with(1, () => 'pl-6')
            .with(2, () => 'pl-10')
            .otherwise(() => 'pl-14')
        return (
            <div key={topic.name}>
                <CommandItem
                    disabled={
                        userTopics ? !userTopics.includes(topic.name) : false
                    }
                    value={topic.name}
                    className={classNames(
                        'hover:bg-blue-800 hover:text-white group',
                        paddingLeft,
                        filteredTopics.some((item) => item === topic.name)
                            ? 'flex'
                            : 'hidden',
                        query.length === 0 ? 'flex' : ''
                    )}
                    onSelect={() => {
                        onChange([...value, topic.name])
                        setOpen(false)
                    }}
                >
                    <CheckIcon
                        className={classNames(
                            'mr-2 h-4 w-4 text-blue-800 group-hover:text-white',
                            value.includes(topic.name)
                                ? 'opacity-100'
                                : 'opacity-0'
                        )}
                    />
                    <DefaultTooltip
                        disabled={
                            userTopics ? userTopics.includes(topic.name) : true
                        }
                        content={
                            <span className="text-black">
                                You are not part of this topic therefore you
                                cant add a dataset to it
                            </span>
                        }
                    >
                        <div
                            className={classNames(
                                topic.children
                                    ? 'font-acumin text-base font-normal text-black group-hover:text-white'
                                    : 'font-acumin text-base font-normal text-neutral-600 group-hover:text-white',
                                userTopics && !userTopics.includes(topic.name)
                                    ? 'text-gray-400'
                                    : ''
                            )}
                        >
                            {topic.title}
                        </div>
                    </DefaultTooltip>
                </CommandItem>
                {topic.children &&
                    topic.children.map((child: TopicHierarchy) =>
                        BuildHierarchy(child, level + 1)
                    )}
            </div>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    id="topicsButton"
                    ref={ref}
                    aria-expanded={open}
                    className="relative flex h-auto min-h-[7rem] w-full flex-row items-start justify-between rounded-md border-0 px-5 py-3 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 hover:bg-white focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                >
                    <div className="flex w-full items-start justify-between">
                        <span className="font-acumin text-base font-light text-zinc-400">
                            {value.length === 0 ? (
                                'Start typing in a topic or select topics from the dropdown'
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {value.map((item, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center gap-x-2 rounded-[3px] border border-blue-800 hover:bg-neutral-50 transition bg-white px-2 py-0.5"
                                        >
                                            <span className="font-['Acumin Pro SemiCondensed'] text-[15px] font-normal text-zinc-800">
                                                {item}
                                            </span>
                                            <DefaultTooltip content="Remove topic">
                                                <XMarkIcon
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onChange(
                                                            value.filter(
                                                                (topic) =>
                                                                    topic !==
                                                                    item
                                                            )
                                                        )
                                                    }}
                                                    className="mt-0.5 h-3 w-3 cursor-pointer text-red-600"
                                                />
                                            </DefaultTooltip>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </span>
                        <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                style={{ width: ref.current?.offsetWidth ?? 'auto' }}
                className="w-full md:w-[28rem] lg:w-[20rem] xl:w-[28rem] bg-white p-0"
            >
                <Command shouldFilter={false}>
                    <div className="flex items-center justify-between px-3 pb-1 pt-3">
                        <span className="font-acumin text-base font-semibold text-black">
                            Topics
                        </span>
                        <div className="flex items-center gap-x-3">
                            <button
                                onClick={() =>
                                    onChange(
                                        query.length === 0
                                            ? flattenedTopicHierarchy
                                                  .filter((item) =>
                                                      userTopics
                                                          ? userTopics.includes(
                                                                item.name
                                                            )
                                                          : true
                                                  )
                                                  .map((item) => item.name)
                                            : [
                                                  ...new Set(
                                                      filteredTopics
                                                          .filter((item) =>
                                                              userTopics
                                                                  ? userTopics.includes(
                                                                        item
                                                                    )
                                                                  : true
                                                          )
                                                          .concat(value)
                                                  ),
                                              ]
                                    )
                                }
                                className="font-acumin text-xs font-normal text-zinc-800 underline"
                            >
                                Select All
                            </button>
                            <button
                                onClick={() => onChange([])}
                                className="font-acumin text-xs font-normal text-zinc-800 underline"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search framework..."
                    />
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <div className="pr-3">
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {topicHierarchy.map((topic) =>
                                BuildHierarchy(topic, 0)
                            )}
                        </CommandGroup>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
