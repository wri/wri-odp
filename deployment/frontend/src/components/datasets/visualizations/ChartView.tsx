import { DownloadIcon } from '@/components/_shared/icons/DownloadIcon'
import { ExportIcon } from '@/components/_shared/icons/ExportIcon'
import { SettingsIcon } from '@/components/_shared/icons/SettingsIcon'
import IconButton from '@/components/_shared/map/controls/IconButton'
import { VegaLite } from 'react-vega'

export default function ChartView() {
    return (
        <div className="relative">
            <div className="absolute right-6 top-5 flex flex-col gap-y-1.5 z-10">
                <IconButton>
                    <SettingsIcon />
                </IconButton>
                <IconButton>
                    <DownloadIcon />
                </IconButton>
                <IconButton>
                    <ExportIcon />
                </IconButton>
            </div>
            <div className="w-full h-full flex justify-center pt-24">
                <VegaLite
                    className="basis-11/12"
                    actions={false}
                    spec={{
                        $schema:
                            'https://vega.github.io/schema/vega-lite/v5.json',
                        height: 500,
                        width: 'container',
                        data: {
                            values: [
                                { a: 'A', b: 28 },
                                { a: 'B', b: 55 },
                                { a: 'C', b: 43 },
                                { a: 'D', b: 91 },
                                { a: 'E', b: 81 },
                                { a: 'F', b: 53 },
                                { a: 'G', b: 19 },
                                { a: 'H', b: 87 },
                                { a: 'I', b: 52 },
                            ],
                        },
                        mark: { type: 'bar', width: 10 },
                        encoding: {
                            x: {
                                field: 'a',
                                type: 'nominal',
                                axis: { labelAngle: 0 },
                            },
                            y: { field: 'b', type: 'quantitative' },
                        },
                    }}
                />
            </div>
        </div>
    )
}
