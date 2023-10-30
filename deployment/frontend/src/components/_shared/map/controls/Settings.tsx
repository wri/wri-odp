import { type MutableRefObject, useState } from 'react'
import Modal from '../../Modal'
import IconButton from './IconButton'
import BasemapSelector from './BaseMapSelector'
import LabelSelector from './LabelSelector'
import { type MapRef } from 'react-map-gl'
import Boundaries from './Boundaries'

export default function Settings({
    mapRef,
}: {
    mapRef: MutableRefObject<MapRef | null>
}) {
    const [open, setOpen] = useState(false)
    return (
        <IconButton onClick={() => setOpen(true)}>
            <SettingsIcon />
            <Modal open={open} setOpen={setOpen} className="max-w-[36rem]">
                <h2 className="font-['Acumin Pro SemiCondensed'] text-3xl font-normal text-black mb-5">
                    Map settings
                </h2>
                <div className="flex flex-row flex-wrap gap-y-5">
                    <div className="basis-1/2 pr-2">
                        <BasemapSelector mapRef={mapRef} />
                    </div>
                    <div className="basis-1/2 pr-2">
                        <LabelSelector mapRef={mapRef} />
                    </div>
                    <div className="basis-1/2">
                        <Boundaries mapRef={mapRef} />
                    </div>
                </div>
            </Modal>
        </IconButton>
    )
}

function SettingsIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7.5 2.78516H17.25M7.5 2.78516C7.5 3.18298 7.34196 3.56451 7.06066 3.84582C6.77936 4.12712 6.39782 4.28516 6 4.28516C5.60218 4.28516 5.22064 4.12712 4.93934 3.84582C4.65804 3.56451 4.5 3.18298 4.5 2.78516M7.5 2.78516C7.5 2.38733 7.34196 2.0058 7.06066 1.7245C6.77936 1.44319 6.39782 1.28516 6 1.28516C5.60218 1.28516 5.22064 1.44319 4.93934 1.7245C4.65804 2.0058 4.5 2.38733 4.5 2.78516M4.5 2.78516H0.75M7.5 14.7852H17.25M7.5 14.7852C7.5 15.183 7.34196 15.5645 7.06066 15.8458C6.77936 16.1271 6.39782 16.2852 6 16.2852C5.60218 16.2852 5.22064 16.1271 4.93934 15.8458C4.65804 15.5645 4.5 15.183 4.5 14.7852M7.5 14.7852C7.5 14.3873 7.34196 14.0058 7.06066 13.7245C6.77936 13.4432 6.39782 13.2852 6 13.2852C5.60218 13.2852 5.22064 13.4432 4.93934 13.7245C4.65804 14.0058 4.5 14.3873 4.5 14.7852M4.5 14.7852H0.75M13.5 8.78516H17.25M13.5 8.78516C13.5 9.18298 13.342 9.56451 13.0607 9.84582C12.7794 10.1271 12.3978 10.2852 12 10.2852C11.6022 10.2852 11.2206 10.1271 10.9393 9.84582C10.658 9.56451 10.5 9.18298 10.5 8.78516M13.5 8.78516C13.5 8.38733 13.342 8.0058 13.0607 7.7245C12.7794 7.44319 12.3978 7.28516 12 7.28516C11.6022 7.28516 11.2206 7.44319 10.9393 7.7245C10.658 8.0058 10.5 8.38733 10.5 8.78516M10.5 8.78516H0.75"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
