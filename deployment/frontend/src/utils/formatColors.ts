export const formatColors = {
    tiff: 'bg-wri-light-green',
    geojson: 'bg-wri-light-blue',
    csv: 'bg-wri-light-yellow',
    html: 'bg-wri-gold',
    pdf: 'bg-red-400',
    xls: 'wri-green',
    xlsx: 'bg-blue-200',
    api: 'wri-gray',
    zip: 'wri-slate',
}

export function getFormatColor(format: string) {
    return formatColors[format.toLowerCase() as keyof typeof formatColors] || 'bg-wri-light-green'
}
