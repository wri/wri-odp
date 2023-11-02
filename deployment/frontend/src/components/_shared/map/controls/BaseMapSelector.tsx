import React from 'react'
import { type Basemap } from '@/interfaces/state.interface'
import { useBasemap } from '@/utils/storeHooks'

const BasemapSelector = () => {
    const basemaps = ['light', 'dark', 'satellite', 'terrain', 'aqueduct']
    const { selectedBasemap, setBasemap } = useBasemap()

    const handleBasemapChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setBasemap(event.target.value as Basemap)
    }

    return (
        <div>
            <label className="mb-2">Basemap:</label>
            <div className="flex flex-col">
                {basemaps.map((basemap) => (
                    <label key={basemap} className="mr-2">
                        <input
                            type="radio"
                            value={basemap}
                            checked={selectedBasemap === basemap}
                            onChange={handleBasemapChange}
                            className="mr-1"
                        />
                        {basemap}
                    </label>
                ))}
            </div>
        </div>
    )
}

export default BasemapSelector
