import { type NextApiRequest, type NextApiResponse } from 'next';
import { env } from '@/env.mjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { dataset, version, format, grid, tile_id, pixel_meaning } =
        req.query;

    if (!dataset || !version || !format || !grid || !tile_id || !pixel_meaning) {
        return res.status(400).json({
            error: 'Missing required query parameters: dataset, version, format, grid, tile_id, pixel_meaning',
        });
    }

    const apiKey: string | undefined = env.GFW_DATA_API_KEY as
        | string
        | undefined;

    if (!apiKey) {
        return res.status(400).json({
            error: 'GFW_DATA_API_KEY is not set',
        });
    }

    const params = new URLSearchParams({
        grid: String(grid),
        tile_id: String(tile_id),
        pixel_meaning: String(pixel_meaning),
        'x-api-key': apiKey,
    });

    const upstream = `https://data-api.globalforestwatch.org/dataset/${encodeURIComponent(String(dataset))}/${encodeURIComponent(String(version))}/download/${encodeURIComponent(String(format))}?${params.toString()}`;

    try {
        const upstreamRes = await fetch(upstream, { redirect: 'follow' });

        if (!upstreamRes.ok) {
            const text = await upstreamRes.text().catch(() => '');
            return res
                .status(upstreamRes.status)
                .json({ error: text || upstreamRes.statusText });
        }

        const contentType = upstreamRes.headers.get('content-type');
        const contentDisposition = upstreamRes.headers.get(
            'content-disposition'
        );
        const contentLength = upstreamRes.headers.get('content-length');

        if (contentType) res.setHeader('Content-Type', contentType);
        if (contentLength) res.setHeader('Content-Length', contentLength);

        const filename = `${String(tile_id)}.tif`;
        res.setHeader(
            'Content-Disposition',
            contentDisposition ?? `attachment; filename="${filename}"`
        );

        const buffer = Buffer.from(await upstreamRes.arrayBuffer());
        return res.send(buffer);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(502).json({ error: `Upstream error: ${message}` });
    }
}

export const config = {
    api: {
        responseLimit: false,
    },
};
