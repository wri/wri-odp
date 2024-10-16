import { Button } from '@/components/_shared/Button'
import { TextWithReadMore } from '@/components/_shared/TextWithReadMore'
import { WriDataset } from '@/schema/ckan.schema'
import classNames from '@/utils/classnames'
import { LinkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export function About({
    dataset,
    isCurrentVersion,
    diffFields,
}: {
    dataset: WriDataset
    isCurrentVersion?: boolean
    diffFields: string[]
}) {
    const highlighted = (field: string) => {
        if (diffFields && !isCurrentVersion) {
            if (diffFields.find((f) => f.includes(field))) {
                return 'bg-yellow-200'
            }
        }
        return ''
    }

    const highlightExtras = (index: number) => {
        return highlighted(`extras[${index}].key`) !== ''
            ? highlighted(`extras[${index}].key`)
            : highlighted(`extras[${index}].value`) !== ''
            ? highlighted(`extras[${index}].value`)
            : highlighted(`extras[${index}]`)
    }
    const highlightTags = (index: number) => {
        return highlighted(`tags[${index}].display_name`) !== ''
            ? highlighted(`tags[${index}].display_name`)
            : highlighted(`tags[${index}].name`) !== ''
            ? highlighted(`tags[${index}].name`)
            : highlighted(`tags[${index}]`)
    }
    return (
        <div className="flex flex-col gap-y-4 py-2">
            <div className="font-acumin text-base font-normal text-black">
                Details
            </div>
            <div className={'flex flex-wrap gap-[0.35rem]'}>
                {dataset.tags?.map((tag, index) => (
                    <Pill
                        key={index}
                        text={tag.display_name ?? tag.name}
                        className={`
                        ${highlightTags(index)}
                    `}
                    />
                ))}
            </div>
            {dataset?.notes && (
                <div>
                    <h3
                        className={`font-acumin text-base font-normal w-fit text-black ${highlighted(
                            'notes'
                        )}`}
                    >
                        About
                    </h3>
                    <TextWithReadMore
                        readMoreTrigger={(readMore: boolean) => (
                            <Button className="mr-auto" variant="gray">
                                Read {readMore ? 'Less' : 'More'}
                            </Button>
                        )}
                        className="text-justify font-acumin text-sm font-light text-stone-900 max-h-[180px]"
                    >
                        <div
                            className="prose max-w-none prose-sm prose-a:text-wri-green prose-pre:bg-pre-code prose-pre:text-black prose-pre:text-base"
                            dangerouslySetInnerHTML={{
                                __html: dataset?.notes ?? '',
                            }}
                        ></div>
                    </TextWithReadMore>
                </div>
            )}
            {dataset.learn_more && (
                <Button
                    className={`font-acumin w-fit text-sm font-semibold text-neutral-700 ${highlighted(
                        'learn_more'
                    )}`}
                >
                    <a
                        href={dataset.learn_more}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </a>
                </Button>
            )}
            <div className="flex flex-col gap-y-2">
                {dataset.url && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt
                                className={`font-acumin text-sm font-semibold text-neutral-700 ${highlighted(
                                    'url'
                                )}`}
                            >
                                {' '}
                                Source:
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                <a
                                    className="text-blue-800 underline"
                                    href={dataset.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {dataset.url ?? ' - '}
                                </a>
                            </dd>
                        </>
                    </div>
                )}
                {dataset.project && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt
                                className={`font-acumin text-sm font-semibold text-neutral-700 ${highlighted(
                                    'project'
                                )}`}
                            >
                                {' '}
                                Project:
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                {dataset.project ?? ' - '}
                            </dd>
                        </>
                    </div>
                )}
                {dataset.groups && dataset.groups.length > 0 && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt
                                className={`font-acumin text-sm font-semibold text-neutral-700 ${highlighted(
                                    'groups'
                                )}`}
                            >
                                {' '}
                                Topics:{' '}
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                {dataset.groups.map((topic, topicIdx) => (
                                    <Link href={`/topics/${topic.name}`}>
                                        {topic.display_name ?? topic.name}
                                        {dataset.groups &&
                                        topicIdx !== dataset.groups?.length - 1
                                            ? ', '
                                            : ''}
                                    </Link>
                                ))}
                            </dd>
                        </>
                    </div>
                )}
                <div>
                    <div className="flex max-w-[36rem] flex-col gap-y-8">
                        {dataset.citation && (
                            <>
                                <h3 className="font-acumin text-base font-normal text-black">
                                    <span
                                        className={classNames(
                                            highlighted('citation')
                                        )}
                                    >
                                        Citation
                                    </span>
                                </h3>
                                <p className="text-justify font-acumin text-sm font-light text-stone-900">
                                    {dataset.citation ?? ' - '}
                                </p>
                            </>
                        )}
                    </div>
                </div>
                {dataset.license_title && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt
                                className={`font-acumin text-sm font-semibold text-neutral-700 ${highlighted(
                                    'license_title'
                                )}`}
                            >
                                License:{' '}
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                {dataset.license_title ?? ' - '}
                            </dd>
                        </>
                    </div>
                )}
                <div className="flex max-w-[36rem] flex-col gap-y-8">
                    {dataset?.reason_for_adding && (
                        <div>
                            <h3
                                className={`font-acumin text-base font-normal w-fit text-black ${highlighted(
                                    'reason_for_adding'
                                )}`}
                            >
                                Reasons for adding
                            </h3>
                            <TextWithReadMore
                                readMoreTrigger={(readMore: boolean) => (
                                    <Button className="mr-auto" variant="gray">
                                        Read {readMore ? 'Less' : 'More'}
                                    </Button>
                                )}
                                className="text-justify font-acumin text-sm font-light text-stone-900 max-h-[180px]"
                            >
                                <div
                                    className="prose max-w-none prose-sm prose-a:text-wri-green"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            dataset?.reason_for_adding ?? '',
                                    }}
                                ></div>
                            </TextWithReadMore>
                        </div>
                    )}
                    {dataset?.restrictions && (
                        <div>
                            <h3
                                className={`font-acumin text-base font-normal w-fit text-black ${highlighted(
                                    'restrictions'
                                )}`}
                            >
                                Restrictions
                            </h3>
                            <TextWithReadMore
                                readMoreTrigger={(readMore: boolean) => (
                                    <Button className="mr-auto" variant="gray">
                                        Read {readMore ? 'Less' : 'More'}
                                    </Button>
                                )}
                                className="text-justify font-acumin text-sm font-light text-stone-900 max-h-[180px]"
                            >
                                <div
                                    className="prose max-w-none prose-sm prose-a:text-wri-green"
                                    dangerouslySetInnerHTML={{
                                        __html: dataset?.restrictions ?? '',
                                    }}
                                ></div>
                            </TextWithReadMore>
                        </div>
                    )}
                </div>
                {dataset.spatial_address && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt
                                className={`font-acumin text-sm font-semibold text-neutral-700 ${highlighted(
                                    'license_title'
                                )}`}
                            >
                                Location:{' '}
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                {dataset.spatial_address ?? ' - '}
                            </dd>
                        </>
                    </div>
                )}
                {dataset.extras?.map((extra, index) => (
                    <div key={extra.key} className="flex items-center gap-x-1">
                        <>
                            <dt
                                className={classNames(
                                    'font-acumin text-sm font-semibold text-neutral-700',
                                    highlightExtras(index)
                                )}
                            >
                                {extra.key}:{' '}
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                {extra.value}
                            </dd>
                        </>
                    </div>
                ))}
            </div>
        </div>
    )
}

function Pill({ text, className }: { text: string; className?: string }) {
    return (
        <div
            className={`rounded-sm border border-blue-800 bg-white px-3 py-[0.35rem] text-xs ${className}`}
        >
            {text}
        </div>
    )
}
