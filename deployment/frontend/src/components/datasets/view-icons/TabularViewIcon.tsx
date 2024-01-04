import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { WriDataset } from '@/schema/ckan.schema'
import { TableCellsIcon } from '@heroicons/react/20/solid'

export default function TabularViewIcon({ dataset }: { dataset: WriDataset }) {
    const hasTabularView = dataset?.resources?.some(
        (r) => r.datastore_active || r.rw_id
    )

    return hasTabularView ? (
        <DefaultTooltip content="Tabular view">
            <div className="rounded-full bg-stone-100 p-1">
                <TableCellsIcon className="h-5 w-5 text-green-600" />
            </div>
        </DefaultTooltip>
    ) : null
}
