export const formatColors = {
    tiff: 'bg-wri-tif',
    tif: 'bg-wri-tif',
    geojson: 'bg-wri-geojson',
    csv: 'bg-wri-csv',
    html: 'bg-wri-gold',
    pdf: 'bg-red-400',
    xls: 'wri-green',
    xlsx: 'bg-blue-200',
    api: 'wri-gray',
    zip: 'wri-slate',
    layer: 'bg-wri-green text-white',
}

export function getFormatColor(format: string) {
    return (
        formatColors[format.toLowerCase() as keyof typeof formatColors] ||
        'bg-wri-light-green'
    )
}
