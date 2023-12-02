import {
    Legend,
    LegendListItem,
    LegendItemToolbar,
    LegendItemButtonLayers,
    LegendItemButtonOpacity,
    LegendItemButtonVisibility,
    LegendItemTypes,
    LegendItemTimeStep,
    Icons,
    // @ts-ignore
} from 'vizzuality-components/dist/bundle'
import { LegendsFormType, SourceFormType } from '../layer.schema'
export function Legends({ layerObj }: { layerObj: any }) {
    if (!layerObj) return <></>
    const lg = {
        id: 'sample-id',
        dataset: 'sample-dataset',
        layers: [layerObj],
    }
    return (
        <div className="c-legend-map">
            <Icons />
            <Legend maxHeight={300}>
                <LegendListItem
                    key={lg.dataset}
                    layerGroup={lg}
                    toolbar={
                        <LegendItemToolbar>
                            <LegendItemButtonLayers />
                            <LegendItemButtonOpacity />
                            <LegendItemButtonVisibility />
                        </LegendItemToolbar>
                    }
                    onChangeInfo={() => console.log('Info')}
                    onChangeOpacity={() => console.log('Info')}
                    onChangeVisibility={() => console.log('Info')}
                    onChangeLayer={() => console.log('Info')}
                >
                    <LegendItemTypes />
                    <LegendItemTimeStep
                        defaultStyles={LEGEND_TIMELINE_PROPERTIES}
                        handleChange={() => console.log('Change')}
                        customClass="rw-legend-timeline"
                        dots={true}
                    />
                </LegendListItem>
            </Legend>
        </div>
    )
}

export const LEGEND_TIMELINE_PROPERTIES = {
    trackStyle: [
        { backgroundColor: '#caccd0' },
        { backgroundColor: '#caccd0' },
    ],
    railStyle: {
        backgroundColor: '#caccd0',
        height: 2,
    },
    handleStyle: [
        {
            backgroundColor: '#c32d7b',
            width: 21,
            height: 21,
            borderWidth: 3,
            borderColor: '#fff',
            transform: 'translate(calc(-50% + 6px), calc(-50% + 12px))',
            top: 0,
        },
        {
            backgroundColor: '#c32d7b',
            width: 21,
            height: 21,
            borderWidth: 3,
            borderColor: '#fff',
            transform: 'translate(calc(-50% + 6px), calc(-50% + 12px))',
            top: 0,
        },
    ],
    dotStyle: {
        width: 16,
        height: 16,
        borderColor: '#caccd0',
        transform: 'translate(calc(-50% + 4px), 50%)',
        bottom: '50%',
        borderWidth: 2,
    },
    activeDotStyle: {
        width: 16,
        height: 16,
        borderColor: '#caccd0',
        transform: 'translate(calc(-50% + 4px), 50%)',
        bottom: '50%',
    },
    markStyle: {
        width: 'auto',
        margin: 0,
        fontFamily: "'Lato', 'Helvetica Neue', Helvetica, Arial, sans",
        color: '#393f44',
    },
}
