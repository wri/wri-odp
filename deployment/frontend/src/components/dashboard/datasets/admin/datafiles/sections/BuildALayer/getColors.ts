import { P, match } from 'ts-pattern'
import { LegendsFormType, RenderFormType } from './layer.schema'

export function getColors(renderItem?: RenderFormType | null) {
    if (!renderItem || !renderItem.layers) return []
    const paintObjs = renderItem.layers
        .flatMap((item) => {
            return [
                item.paint?.['fill-color'],
                item.paint?.['line-color'],
                item.paint?.['circle-color'],
            ]
        })
        .filter((item) => item !== undefined)
        .flatMap((item) => {
            return match(item)
                .with(P.string, (str) => [str])
                .with(
                    {
                        output: P.select('output'),
                    },
                    ({ output }) =>
                        output
                            .map((item) => item.color)
                            .filter((item) => item !== undefined)
                )
                .otherwise(() => [])
        })
    return paintObjs
}

export function legendsToAdd(
    legends?: LegendsFormType | null,
    render?: RenderFormType | null
) {
    const existingColors = legends
        ? legends.items.map((item) => item.color)
        : []
    const colors = getColors(render)
    const colorsToAdd = colors
        .filter(
            (item) =>
                !existingColors.includes(item) &&
                !existingColors.includes(
                    `#${item[1]}${item[1]}${item[2]}${item[2]}${item[3]}${item[3]}`
                )
        )
        .map((item) => {
            if (item.length === 7) return item
            if (item.length === 4)
                return `#${item[1]}${item[1]}${item[2]}${item[2]}${item[3]}${item[3]}`
        })
    return colorsToAdd
}
