import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { View } from '@/interfaces/dataset.interface'
import { WriDataset } from '@/schema/ckan.schema'
import { ChartBarIcon } from '@heroicons/react/20/solid'

export default function ChartViewIcon({ dataset }: { dataset: WriDataset }) {
    const hasChartView = dataset?.resources?.some((r) =>
        r?._views?.some((v: View) => v.config_obj.type == 'chart')
    )

    return hasChartView ? (
        <DefaultTooltip content="Chart View">
            <div className="rounded-full bg-stone-100 p-1">
                <ChartBarIcon className="h-5 w-5 text-blue-700" />
            </div>
        </DefaultTooltip>
    ) : null
}
