import { Button } from '@/components/_shared/Button'
import { TextWithReadMore } from '@/components/_shared/TextWithReadMore'
import { WriDataset } from '@/schema/ckan.schema'
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
    const higlighted = (field: string) => {
        if (diffFields && !isCurrentVersion) {
            if (diffFields.find((f) => f.includes(field))) {
                return 'bg-yellow-200'
            }
        }
        return ''
    }
    return (
        <div className="flex flex-col gap-y-4 py-2">
            <div className="font-acumin text-base font-normal text-black">
                Details
            </div>
            {dataset.technical_notes && (
                <a
                    href={dataset.technical_notes}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex gap-x-1 font-acumin text-sm font-semibold text-wri-green"
                >
                    <LinkIcon
                        className={`h-4 w-4  ${higlighted('technical_notes')}`}
                    />
                    Technical Notes
                </a>
            )}
            <div className={'flex flex-wrap gap-[0.35rem]'}>
                {dataset.tags?.map((tag, index) => (
                    <Pill
                        key={index}
                        text={tag.display_name ?? tag.name}
                        className={`
                        ${
                            higlighted(`tags[${index}].display_name`) ??
                            higlighted(`tags[${index}].name`)
                        }
                    `}
                    />
                ))}
            </div>
            <div className="flex flex-col gap-y-2">
                {dataset.project && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt
                                className={`font-acumin text-sm font-semibold text-neutral-700 ${higlighted(
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
                                className={`font-acumin text-sm font-semibold text-neutral-700 ${higlighted(
                                    'groups'
                                )}`}
                            >
                                {' '}
                                Topics:{' '}
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                {dataset.groups.map((topic, topicIdx) => (
                                    <Link href={`/topics/${topic.name}`}>
                                        {topic.display_name}
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
                {dataset.license_title && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt
                                className={`font-acumin text-sm font-semibold text-neutral-700 ${higlighted(
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
                {dataset.extras?.map((extra) => (
                    <div key={extra.key} className="flex items-center gap-x-1">
                        <>
                            <dt className="font-acumin text-sm font-semibold text-neutral-700">
                                {extra.key}:{' '}
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                {extra.value}
                            </dd>
                        </>
                    </div>
                ))}
            </div>
            <div className="flex max-w-[36rem] flex-col gap-y-8">
                <div>
                    {dataset.citation && (
                        <>
                            <h3
                                className={`font-acumin text-base font-normal text-black ${higlighted(
                                    'citation'
                                )}`}
                            >
                                Citation
                            </h3>
                            <p className="text-justify font-acumin text-sm font-light text-stone-900">
                                {dataset.citation ?? ' - '}
                            </p>
                        </>
                    )}
                </div>
                {dataset?.notes && (
                    <div>
                        <h3
                            className={`font-acumin text-base font-normal text-black ${higlighted(
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
                                className="prose max-w-none prose-sm prose-a:text-wri-green"
                                dangerouslySetInnerHTML={{
                                    __html: dataset?.notes ?? '',
                                }}
                            ></div>
                        </TextWithReadMore>
                    </div>
                )}
                {dataset?.reason_for_adding && (
                    <div>
                        <h3
                            className={`font-acumin text-base font-normal text-black ${higlighted(
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
                                    __html: dataset?.reason_for_adding ?? '',
                                }}
                            ></div>
                        </TextWithReadMore>
                    </div>
                )}
                {dataset?.restrictions && (
                    <div>
                        <h3
                            className={`font-acumin text-base font-normal text-black ${higlighted(
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
