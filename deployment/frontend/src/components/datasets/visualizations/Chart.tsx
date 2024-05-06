import Plot from 'react-plotly.js'
import { ChartViewConfig } from '@/interfaces/dataset.interface'

export default function Chart({
    config,
    datarevision,
}: {
    config: ChartViewConfig
    datarevision?: number
}) {
    return (
        <Plot
            data={config.props?.data}
            layout={{
                ...config.props?.layout,
                modebar: { orientation: 'h' },
                datarevision,
            }}
            className="w-full h-full"
            config={{ displaylogo: false }}
        />
    )
}
