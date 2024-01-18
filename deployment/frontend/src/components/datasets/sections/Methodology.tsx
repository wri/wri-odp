import { Button } from '@/components/_shared/Button'
import { TextWithReadMore } from '@/components/_shared/TextWithReadMore'

export function Methodology({ methodology }: { methodology: string }) {
    return (
        <div className="font-acumin text-sm font-light text-stone-900 flex flex-col gap-y-4 py-2">
            <TextWithReadMore
                className="max-h-[390px]"
                readMoreTrigger={(readMore) => (
                    <Button variant="gray">
                        {readMore ? 'Read Less' : 'Read More'}
                    </Button>
                )}
            >
                <div className='prose prose-sm max-w-none prose-a:text-wri-green' dangerouslySetInnerHTML={{ __html: methodology }} />
            </TextWithReadMore>
        </div>
    )
}
