import { Button } from '@/components/_shared/Button'
import { TextWithReadMore } from '@/components/_shared/TextWithReadMore'
import { LinkIcon } from '@heroicons/react/24/outline'

export function Methodology({
    methodology = '',
    technical_notes = '',
}: {
    methodology?: string
    technical_notes?: string
}) {
    return (
        <div className="font-acumin text-sm font-light text-stone-900 flex flex-col gap-y-4 py-2">
                <a
                    href={technical_notes}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=
                        "flex items-center gap-x-1 mt-4 w-fit"
                >
                    <LinkIcon className="h-4 w-4 text-wri-green" />
                    <div className="font-['Acumin Pro SemiCondensed'] text-sm font-semibold text-green-700">
                        Technical Notes
                    </div>
                </a>

            <TextWithReadMore
                className="max-h-[390px]"
                readMoreTrigger={(readMore) => (
                    <Button variant="gray">
                        {readMore ? 'Read Less' : 'Read More'}
                    </Button>
                )}
            >
                <div
                    className="prose prose-sm max-w-none prose-a:text-wri-green"
                    dangerouslySetInnerHTML={{ __html: methodology }}
                />
            </TextWithReadMore>
        </div>
    )
}
