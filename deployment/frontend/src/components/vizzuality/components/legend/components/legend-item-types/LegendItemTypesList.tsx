import LegendItemTypes from '.'

export default function LegendItemTypesList(props: any) {
    let legendConfigs: any = []

    const legendConfigOg = props?.activeLayer?.legendConfig
    if (legendConfigOg) {
        if (legendConfigOg.type == 'multiple') {
            legendConfigs = legendConfigOg.items
        } else {
            legendConfigs = [legendConfigOg]
        }
    }

    return legendConfigs.map((lc: any, i: number) => (
        <LegendItemTypes
            {...{
                ...props,
                activeLayer: { ...props?.activeLayer, legendConfig: lc },
            }}
        />
    ))
}
