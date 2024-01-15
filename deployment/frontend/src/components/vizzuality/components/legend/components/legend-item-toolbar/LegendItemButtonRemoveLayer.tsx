import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { useActiveLayerGroups, useDataset } from '@/utils/storeHooks'
import { XMarkIcon } from '@heroicons/react/24/solid'

export default function LegendItemButtonRemoveLayer(props: any) {
    const { removeLayerFromLayerGroup, addLayerToLayerGroup } =
        useActiveLayerGroups()
    const { dataset } = useDataset()

    return dataset.id != props.dataset ? (
        <DefaultTooltip content="Remove layer">
            <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                    removeLayerFromLayerGroup(
                        props.activeLayer.id,
                        props.dataset
                    )
                }}
            >
                <XMarkIcon className="w-5" />
            </button>
        </DefaultTooltip>
    ) : null
}
