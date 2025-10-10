type LegendTypeLegendConfigType =
    | 'proportional'
    | 'gradient'
    | 'choropleth'
    | 'basic'

export interface LegendTypeProps {
    activeLayer: {
        legendConfig: {
            type: LegendTypeLegendConfigType
            items: LegendTypeLegendConfigItem[]
        }
    }
}

interface LegendTypeLegendConfigItem {
    name: string
    color: string
    styles?: string
    size: string
    value: string
    items?: LegendTypeLegendConfigItem[]
}
