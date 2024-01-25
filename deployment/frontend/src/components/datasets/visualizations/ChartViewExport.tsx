import { useState } from 'react'
import { DocumentDuplicateIcon } from '@heroicons/react/20/solid'
import { useActiveDatafileCharts, useDataset } from '@/utils/storeHooks'
import IconButton from '@/components/_shared/map/controls/IconButton'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { Button } from '@/components/_shared/Button'
import Modal from '@/components/_shared/Modal'
import { View } from '@/interfaces/dataset.interface'

export default function ChartViewExport() {
    const { activeDatafileCharts } = useActiveDatafileCharts()
    const { dataset } = useDataset()
    const [open, setOpen] = useState(false)
    const searchParams = new URLSearchParams(window.location.search)
    const chartsId = activeDatafileCharts.map((df: View) => df.id).join(',')

    const embedUrl = `${window.location.origin}/datasets/${dataset.name}/embed/chart?charts=${chartsId}`

    const iFrameHtml = `<iframe src="${embedUrl}" width="1000" height="800" />`
    return (
        <IconButton tooltip="Embed this view" onClick={() => setOpen(true)}>
            <ExportIcon />

            <Modal
                open={open}
                setOpen={setOpen}
                className="w-full max-w-[48rem] mx-5"
            >
                <h2 className="font-['Acumin Pro SemiCondensed'] text-3xl font-normal text-black mb-5">
                    Export as
                </h2>
                <div className="flex flex-row flex-wrap gap-y-5">
                    <div className="basis-full pr-2">
                        <p>Embed this view</p>
                        <TextArea
                            type="text"
                            disabled={true}
                            value={iFrameHtml}
                            className="h-48"
                        >
                            <div className="absolute right-5 bottom-2">
                                <DefaultTooltip content="Copy to clipboard">
                                    <Button
                                        className=" h-auto rounded-full p-2"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                iFrameHtml
                                            )
                                        }}
                                    >
                                        <DocumentDuplicateIcon className="w-5 text-white" />
                                    </Button>
                                </DefaultTooltip>
                            </div>
                        </TextArea>
                    </div>
                </div>
            </Modal>
        </IconButton>
    )
}

function ExportIcon() {
    return (
        <svg
            width="22.5"
            height="23.25"
            viewBox="0 0 25 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M14.4683 5.32715H4.15576C3.40984 5.32715 2.69447 5.63334 2.16702 6.17837C1.63958 6.7234 1.34326 7.46261 1.34326 8.2334V21.7959C1.34326 22.5667 1.63958 23.3059 2.16702 23.8509C2.69447 24.396 3.40984 24.7021 4.15576 24.7021H17.2808C18.0267 24.7021 18.7421 24.396 19.2695 23.8509C19.7969 23.3059 20.0933 22.5667 20.0933 21.7959V11.1396M6.96826 18.8896L23.8433 1.45215M23.8433 1.45215H17.2808M23.8433 1.45215V8.2334"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
