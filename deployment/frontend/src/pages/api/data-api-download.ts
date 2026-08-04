import { type NextApiRequest, type NextApiResponse } from 'next';
import { env } from '@/env.mjs';
import { Readable } from 'stream';

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

    const apiKey: string | undefined = env.GFW_DATA_API_KEY;

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
        // GFW returns 307 to a signed S3/CDN URL. Do not follow it here —
        // buffering the GeoTIFF through Next idle-times out (~60s) with 502.
        // Pass the Location through so the browser downloads directly.
        const upstreamRes = await fetch(upstream, { redirect: 'manual' });

        if (upstreamRes.status >= 300 && upstreamRes.status < 400) {
            const location = upstreamRes.headers.get('location');
            if (!location) {
                return res
                    .status(502)
                    .json({ error: 'Upstream redirect missing Location' });
            }
            return res.redirect(307, location);
        }

        if (!upstreamRes.ok) {
            const text = await upstreamRes.text().catch(() => '');
            return res
                .status(upstreamRes.status)
                .json({ error: text || upstreamRes.statusText });
        }

        // Rare non-redirect success: stream instead of buffering the whole file.
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

        if (!upstreamRes.body) {
            return res.status(502).json({ error: 'Upstream returned empty body' });
        }

        // @ts-expect-error Node Readable.fromWeb accepts the fetch body stream
        Readable.fromWeb(upstreamRes.body).pipe(res);
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
