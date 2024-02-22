import { Button } from '@/components/_shared/Button'
import { TextWithReadMore } from '@/components/_shared/TextWithReadMore'
import { Accordion } from '@/components/dashboard/datasets/admin/Accordion'
import { WriDataset } from '@/schema/ckan.schema'
import { api } from '@/utils/api'
import { ClockIcon } from '@heroicons/react/24/outline'

export function Versioning({
    dataset,
    isCurrentVersion,
    diffFields,
}: {
    dataset: WriDataset
    isCurrentVersion?: boolean
    diffFields: string[]
}) {
    const {
        data: releaseNotes,
        isLoading: isReleaseNotesLoading,
        error: releaseNotesError,
    } = api.dataset.getDatasetReleaseNotes.useQuery(
        { id: dataset.id },
        {
            select: (data) => {
                return (data || []).reverse()
            },
        }
    )

    const isReleaseNotesChanged = diffFields.includes('release_notes') && !isCurrentVersion

    return (
        <div className="flex flex-col gap-y-4 py-2">
            <div className="flex flex-col gap-y-4">
                {isReleaseNotesChanged && (
                    <ReleaseNotesCard
                        releaseNotes={dataset.release_notes}
                        version={'Pending'}
                        isPending={true}
                        defaultOpen={true}
                    />
                )}
                {releaseNotes?.map((rn, i) => (
                    <ReleaseNotesCard
                        releaseNotes={rn.release_notes}
                        date={rn.date}
                        version={`Version ${i + 1}`}
                        key={`release-notes-${i}`}
                        defaultOpen={!isReleaseNotesChanged && i == 0}
                    />
                ))}
                {!isReleaseNotesChanged && !releaseNotes?.length && (
                    <span>This dataset is at it's initial version</span>
                )}
            </div>
        </div>
    )
}

function ReleaseNotesCard({
    releaseNotes,
    date,
    isPending,
    defaultOpen,
    version,
}: {
    releaseNotes: string
    date?: string
    isPending?: boolean
    defaultOpen?: boolean
    version: string
}) {
    // TODO: change this to an expansion panel
    if (date) {
        date = new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div>
            <Accordion
                defaultOpen={defaultOpen}
                title={
                    <span className={isPending ? 'bg-yellow-200' : ''}>
                        {version} {date ? ' - ' : ' '}
                        {date}
                    </span>
                }
                icon={<ClockIcon className="w-4" />}
            >
                <div
                    className="prose max-w-none prose-sm prose-a:text-wri-green min-h-[100px]"
                    dangerouslySetInnerHTML={{
                        __html: releaseNotes ?? '',
                    }}
                ></div>
            </Accordion>
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
