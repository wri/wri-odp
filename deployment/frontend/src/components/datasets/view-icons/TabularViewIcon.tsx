import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { WriDataset, WriDatasetWithoutDetails } from '@/schema/ckan.schema'
import { TableCellsIcon } from '@heroicons/react/20/solid'

export default function TabularViewIcon({
    dataset,
}: {
    dataset: WriDatasetWithoutDetails
}) {
    const hasTabularView =
        dataset?.rw_id || dataset?.resources?.some((r) => r.datastore_active)

    return hasTabularView ? (
        <DefaultTooltip content="Tabular view">
            <div className="rounded-full bg-stone-100 p-1">
                <TableCellsIcon className="h-5 w-5 text-green-600" />
            </div>
        </DefaultTooltip>
    ) : null
}
