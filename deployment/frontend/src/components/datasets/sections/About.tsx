import { Button } from '@/components/_shared/Button'
import { TextWithReadMore } from '@/components/_shared/TextWithReadMore'
import { WriDataset } from '@/schema/ckan.schema'
import { LinkIcon } from '@heroicons/react/24/outline'

export function About({ dataset }: { dataset: WriDataset }) {
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
                    <LinkIcon className="h-4 w-4" />
                    Technical Notes
                </a>
            )}
            <div className="flex flex-wrap gap-[0.35rem]">
                {dataset.tags?.map((tag) => (
                    <Pill text={tag.display_name ?? tag.name} />
                ))}
            </div>
            <div className="flex flex-col gap-y-2">
                {dataset.project && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt className="font-acumin text-sm font-semibold text-neutral-700">
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
                            <dt className="font-acumin text-sm font-semibold text-neutral-700">
                                {' '}
                                Topics:{' '}
                            </dt>
                            <dd className="mb-1 text-sm font-light text-stone-900">
                                {dataset.groups
                                    .map((topic) => topic.display_name)
                                    .join(', ')}
                            </dd>
                        </>
                    </div>
                )}
                {dataset.license_title && (
                    <div className="flex items-center gap-x-1">
                        <>
                            <dt className="font-acumin text-sm font-semibold text-neutral-700">
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
                            <h3 className="font-acumin text-base font-normal text-black">
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
                        <h3 className="font-acumin text-base font-normal text-black">
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
                        <h3 className="font-acumin text-base font-normal text-black">
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
                        <h3 className="font-acumin text-base font-normal text-black">
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

function Pill({ text }: { text: string }) {
    return (
        <div className="rounded-sm border border-blue-800 bg-white px-3 py-[0.35rem] text-xs">
            {text}
        </div>
    )
}
