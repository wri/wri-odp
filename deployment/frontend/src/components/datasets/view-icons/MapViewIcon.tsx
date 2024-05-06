import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { WriDataset, WriDatasetWithoutDetails } from '@/schema/ckan.schema'
import { GlobeAltIcon } from '@heroicons/react/20/solid'

export default function MapViewIcon({
    dataset,
}: {
    dataset: WriDatasetWithoutDetails
}) {
    const hasMapView = dataset?.resources?.some((r) => r.format == 'Layer')

    return hasMapView ? (
        <DefaultTooltip content="Map view">
            <div className="rounded-full bg-stone-100 p-1">
                <GlobeAltIcon className="h-5 w-5 text-emerald-700" />
            </div>
        </DefaultTooltip>
    ) : null
}
