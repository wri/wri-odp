import { type MutableRefObject, useState } from 'react'
import Modal from '../../Modal'
import IconButton from './IconButton'
import BasemapSelector from './BaseMapSelector'
import LabelSelector from './LabelSelector'
import { type MapRef } from 'react-map-gl'
import Boundaries from './Boundaries'
import {SettingsIcon} from '../../icons/SettingsIcon'

export default function Settings({
    mapRef,
}: {
    mapRef: MutableRefObject<MapRef | null>
}) {
    const [open, setOpen] = useState(false)
    return (
        <IconButton tooltip='Map settings' onClick={() => setOpen(true)}>
            <SettingsIcon />
            <Modal open={open} setOpen={setOpen} className="max-w-[36rem]">
                <h2 className="font-['Acumin Pro SemiCondensed'] text-3xl font-normal text-black mb-5">
                    Map settings
                </h2>
                <div className="flex flex-row flex-wrap gap-y-5">
                    <div className="basis-1/2 pr-2">
                        <BasemapSelector />
                    </div>
                    <div className="basis-1/2 pr-2">
                        <LabelSelector />
                    </div>
                    <div className="basis-1/2">
                        <Boundaries mapRef={mapRef} />
                    </div>
                </div>
            </Modal>
        </IconButton>
    )
}

