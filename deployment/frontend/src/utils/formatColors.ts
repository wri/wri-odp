export const formatColors = {
    tiff: 'bg-wri-tif border border-[#D3EED1]',
    tif: 'bg-wri-tif border border-[#D3EED1]',
    geojson: 'bg-wri-geojson',
    json: 'bg-wri-geojson',
    csv: 'bg-wri-csv',
    html: 'bg-wri-gold',
    pdf: 'bg-red-400',
    xls: 'bg-wri-xlsx',
    xlsx: 'bg-wri-xlsx',
    api: 'wri-gray',
    zip: 'bg-wri-zip text-white',
    layer: 'bg-wri-green text-white',
};

export function getFormatColor(format: string) {
    return (
        formatColors[format.toLowerCase() as keyof typeof formatColors] ||
        'bg-wri-light-green'
    );
}
