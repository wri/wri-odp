import { Popup } from 'react-map-gl'

export function Tooltip({ layersInfo, coordinates, close }: any) {
    if (layersInfo.length === 0) return <></>
    if (!coordinates) return <></>
    return (
        <Popup
            {...coordinates}
            closeButton
            closeOnClick={false}
            onClose={() => close()}
            maxWidth={'250px'}
        >
            {layersInfo.map((info: any, i: number) => {
                return (
                    <div key={`tooltip-layer-${i}`} className="mb-5">
                        <h1 className="font-semibold line-clamp-1 text-lg">
                            {info.name}
                        </h1>
                        <div>
                            {info.properties?.map((prop: any, j: number) => {
                                return (
                                    <p
                                        key={`tooltip-layer-${i}-prop-${j}`}
                                        className="text-sm"
                                    >
                                        <span className="font-semibold">
                                            {prop.config.property ||
                                                prop.config.column}
                                            :
                                        </span>{' '}
                                        {prop.value ?? ''}
                                    </p>
                                )
                            }) || (
                                <p className="text-sm">
                                    No info found for this coordinate
                                </p>
                            )}
                        </div>
                    </div>
                )
            })}
        </Popup>
    )
}

export default Tooltip
