import { describe, expect, it } from 'vitest';
import {
    estimateSelectedTilesBytes,
    estimateSelectedTilesSize,
    estimateTileBytes,
    formatFileSize,
    getCopyLinkValue,
    getDataApiTileGfwUrls,
    getResourceFormatLabel,
    getResourceSize,
    getResourceSizeProbeUrl,
    getVersionFromTilePath,
    isCopyLinkResource,
    isDataApiResource,
    isDownloadableResource,
    isGeeAssetResource,
    isTileCacheResource,
    tileToBbox,
} from '../src/components/datasets-v2/DatasetDetailsHeader/download-utils';

const TILE =
    '/vsis3/gfw-data-lake/landmark_indigenous_and_community_lands/v20201215/raster/epsg-4326/10/40000/is/geotiff/20N_110E.tif';

describe('download-utils resource predicates', () => {
    it('detects data API resources regardless of persisted tiles', () => {
        expect(isDataApiResource({ type: 'data-api-dataset' })).toBe(true);
        expect(isDataApiResource({ url_type: 'data-api-dataset' })).toBe(true);
        expect(
            isDataApiResource({
                type: 'data-api-dataset',
                data_api_tiles: [],
            })
        ).toBe(true);
        expect(isDataApiResource({ type: 'upload' })).toBe(false);
    });

    it('treats data API resources without key or url as downloadable', () => {
        expect(
            isDownloadableResource({
                type: 'data-api-dataset',
                data_api_dataset_id: 'landmark',
            })
        ).toBe(true);
    });

    it('detects GEE assets and tile caches as copy-only', () => {
        expect(isGeeAssetResource({ type: 'gee-asset' })).toBe(true);
        expect(isTileCacheResource({ type: 'tile-cache' })).toBe(true);
        expect(isCopyLinkResource({ type: 'gee-asset' })).toBe(true);
        expect(isCopyLinkResource({ type: 'upload' })).toBe(false);
    });

    it('never lists copy-only resources as downloadable', () => {
        expect(
            isDownloadableResource({
                type: 'gee-asset',
                asset_id: "ee.Image('projects/x/y')",
            })
        ).toBe(false);
        expect(
            isDownloadableResource({
                type: 'tile-cache',
                url: 'https://example.com/{z}/{x}/{y}.png',
            })
        ).toBe(false);
        expect(isDownloadableResource({ type: 'upload', url: 'https://example.com/a.zip' })).toBe(
            true
        );
        expect(isDownloadableResource({ type: 'upload', key: 'resources/a.zip' })).toBe(true);
    });

    it('resolves the copy value from asset id or url', () => {
        expect(getCopyLinkValue({ type: 'gee-asset', asset_id: 'projects/x/y' })).toBe(
            'projects/x/y'
        );
        expect(getCopyLinkValue({ type: 'tile-cache', url: 'https://example.com/tiles' })).toBe(
            'https://example.com/tiles'
        );
        expect(getCopyLinkValue({ type: 'gee-asset' })).toBe('');
    });

    it('labels the new resource types', () => {
        expect(getResourceFormatLabel({ type: 'data-api-dataset' })).toBe('Raster Tile Set');
        expect(getResourceFormatLabel({ type: 'gee-asset' })).toBe('Google Earth Engine asset');
        expect(getResourceFormatLabel({ type: 'tile-cache' })).toBe('Tile cache');
        expect(getResourceFormatLabel({ type: 'upload', format: 'CSV' })).toBe('CSV');
    });

    it('never renders an empty badge for blank formats', () => {
        // `format` is commonly saved as '' rather than null.
        expect(
            getResourceFormatLabel({
                type: 'link',
                url: 'https://gfw2-data.s3.amazonaws.com/ldacs/annual.zip',
                format: '',
            })
        ).toBe('ZIP');
        expect(getResourceFormatLabel({ type: 'link', url: '', format: '   ' })).toBe('LINK');
        expect(getResourceFormatLabel({ type: 'upload', key: 'resources/a.bin' })).toBe('FILE');
    });

    it('does not mistake numeric DOI suffixes for file extensions', () => {
        expect(
            getResourceFormatLabel({
                type: 'link',
                format: '',
                url: 'https://doi.org/10.5281/zenodo.13890401',
            })
        ).toBe('LINK');
        expect(
            getResourceFormatLabel({
                type: 'link',
                format: '',
                url: 'https://example.com/data/file.tif',
            })
        ).toBe('TIF');
    });

    it('prefers the stored format over the URL extension', () => {
        expect(
            getResourceFormatLabel({
                type: 'link',
                format: 'CSV',
                url: 'https://example.com/download.zip',
            })
        ).toBe('CSV');
    });
});

describe('download-utils tile helpers', () => {
    it('derives a bbox from a tile path', () => {
        expect(tileToBbox(TILE)).toEqual([110, 10, 120, 20]);
    });

    it('recovers the dataset version from a tile path', () => {
        expect(getVersionFromTilePath(TILE)).toBe('v20201215');
        expect(getVersionFromTilePath('/not/a/tile')).toBeNull();
    });

    it('builds GFW download URLs when the version is only in the tile path', () => {
        const urls = getDataApiTileGfwUrls({
            data_api_tiles: [TILE],
            data_api_dataset_id: 'landmark',
        });

        expect(urls).toHaveLength(1);
        expect(urls[0]).toContain('/dataset/landmark/v20201215/download/geotiff');
        expect(urls[0]).toContain('grid=10/40000');
        expect(urls[0]).toContain('tile_id=20N_110E');
    });

    it('filters GFW download URLs down to the selected tiles', () => {
        const other = TILE.replace('20N_110E', '20N_120E');
        const resource = {
            data_api_tiles: [TILE, other],
            data_api_dataset_id: 'landmark',
            data_api_version: 'v20201215',
        };

        expect(getDataApiTileGfwUrls(resource)).toHaveLength(2);
        expect(getDataApiTileGfwUrls(resource, [other])).toHaveLength(1);
        expect(getDataApiTileGfwUrls(resource, [other])[0]).toContain('tile_id=20N_120E');
    });

    it('returns no URLs without a dataset id', () => {
        expect(getDataApiTileGfwUrls({ data_api_tiles: [TILE] })).toEqual([]);
    });
});

describe('download-utils size estimation', () => {
    // Shape of a single feature of the GFW `tiles_info` GeoJSON.
    // Note `pixelxsize` is reported in metres and `width`/`height` are the size
    // of the whole 10 degree tile, not of a single pixel block.
    const DEFLATE_TILE = {
        properties: {
            name: '/vsis3/gfw-data-lake/umd_tree_cover_density_2000/v1.8/raster/epsg-4326/10/40000/percent/geotiff/30S_110W.tif',
            width: 40000,
            height: 40000,
            pixelxsize: 0.00025,
            pixelysize: 0.00025,
            compression: 'DEFLATE',
            bands: [{ data_type: 'uint8', nbits: null }],
        },
    };

    it('ignores missing or zero resource sizes', () => {
        expect(getResourceSize({ size: null })).toBeUndefined();
        expect(getResourceSize({ size: 0 })).toBeUndefined();
        expect(getResourceSize({})).toBeUndefined();
        expect(getResourceSize({ size: 2048 })).toBe(2048);
    });

    it('probes link URLs CKAN saved without a size', () => {
        const url = 'https://lcl.wridata.org/concessions/gfw_wood_fiber_v2025.zip';

        // The reported case: a link resource imported with `size: null`.
        expect(getResourceSizeProbeUrl({ type: 'link', url })).toBe(url);
        expect(getResourceSizeProbeUrl({ url })).toBe(url);

        // A CKAN size is already authoritative.
        expect(getResourceSizeProbeUrl({ url, size: 986583 })).toBeNull();
        expect(getResourceSizeProbeUrl({ url, size: 0 })).toBe(url);

        // Tiles are sized from `tiles_info`, copy-links are not downloaded and
        // S3 keys cannot be probed from the server.
        expect(getResourceSizeProbeUrl({ url, type: 'data-api-dataset' })).toBeNull();
        expect(getResourceSizeProbeUrl({ url, type: 'gee-asset' })).toBeNull();
        expect(getResourceSizeProbeUrl({ url, type: 'tile-cache' })).toBeNull();
        expect(getResourceSizeProbeUrl({ url, key: 'resources/file.zip' })).toBeNull();
        expect(getResourceSizeProbeUrl({ url: 'not-a-url' })).toBeNull();
        expect(getResourceSizeProbeUrl({})).toBeNull();
    });

    it('estimates a compressed tile from its pixel size and band type', () => {
        // 10 degrees at 0.00025 deg/px -> 40000x40000 uint8 px, DEFLATE (~5%).
        const estimate = estimateTileBytes(DEFLATE_TILE.properties);

        expect(estimate).toBeGreaterThan(60 * 1024 * 1024);
        expect(estimate).toBeLessThan(90 * 1024 * 1024);
    });

    it('estimates tiles whose pixel size is reported in metres', () => {
        // `umd_tree_cover_density_2000` reports a 110 m pixel size.
        const estimate = estimateTileBytes({ ...DEFLATE_TILE.properties, pixelxsize: 110 });

        expect(estimate).toBeGreaterThan(60 * 1024 * 1024);
        expect(estimate).toBeLessThan(90 * 1024 * 1024);
    });

    it('estimates tiles whose pixel size is reported as zero on one axis', () => {
        const estimate = estimateTileBytes({ ...DEFLATE_TILE.properties, pixelxsize: 0 });

        expect(estimate).toBeGreaterThan(60 * 1024 * 1024);
    });

    it('estimates more bytes for higher bit depth bands', () => {
        const floatTile = {
            ...DEFLATE_TILE.properties,
            bands: [{ data_type: 'float32', nbits: null }],
        };

        expect(estimateTileBytes(floatTile)).toBeGreaterThan(
            estimateTileBytes(DEFLATE_TILE.properties) * 3
        );
    });

    it('accepts both numpy and GTiff band type names', () => {
        const bytes = (data_type: string) =>
            estimateTileBytes({
                ...DEFLATE_TILE.properties,
                bands: [{ data_type, nbits: null }],
            });

        expect(bytes('uint8')).toBe(bytes('Byte'));
        expect(bytes('uint16')).toBe(bytes('UInt16'));
        expect(bytes('int32')).toBe(bytes('Int32'));
        expect(bytes('float64')).toBe(bytes('Float64'));
        expect(bytes('uint16')).toBeCloseTo(bytes('uint8') * 2, -4);
    });

    it('never reports less than a minimal tile', () => {
        expect(estimateTileBytes(null)).toBe(0);
        // No band or compression info: 256x256 px at the default 10% ratio.
        expect(estimateTileBytes({ compression: null, bands: null })).toBeGreaterThan(0);
        expect(estimateTileBytes({ compression: null, bands: null })).toBeLessThan(16 * 1024);
        // An unknown band type is treated as a single byte per pixel.
        expect(
            estimateTileBytes({ ...DEFLATE_TILE.properties, bands: [{ data_type: null }] })
        ).toBe(estimateTileBytes(DEFLATE_TILE.properties));
    });

    it('only adds up the selected tiles', () => {
        const otherTile = {
            properties: { ...DEFLATE_TILE.properties, name: '/tiles/30S_120W.tif' },
        };
        const features = [DEFLATE_TILE, otherTile];
        const single = estimateTileBytes(DEFLATE_TILE.properties);

        expect(estimateSelectedTilesBytes(features, new Set())).toBe(0);
        expect(estimateSelectedTilesBytes(features, new Set([DEFLATE_TILE.properties.name]))).toBe(
            single
        );
        expect(estimateSelectedTilesBytes(features, new Set())).toBe(0);
        expect(
            estimateSelectedTilesBytes(
                features,
                new Set([DEFLATE_TILE.properties.name, otherTile.properties.name])
            )
        ).toBe(single * 2);
    });

    it('falls back to the resource size per selected tile', () => {
        expect(estimateSelectedTilesSize({ size: 10_000 }, ['a', 'b'])).toBe(20_000);
        expect(estimateSelectedTilesSize({}, ['a'])).toBe(0);
        expect(estimateSelectedTilesSize({ size: 10_000 }, [])).toBe(0);
        // `tiles_info` wins over the resource size when available.
        expect(
            estimateSelectedTilesSize({ size: 1 }, [DEFLATE_TILE.properties.name], [DEFLATE_TILE])
        ).toBe(estimateTileBytes(DEFLATE_TILE.properties));
    });

    it('formats gigabyte sizes', () => {
        expect(formatFileSize(512)).toBe('512 B');
        expect(formatFileSize(2048)).toBe('2.0 KB');
        expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
        expect(formatFileSize(3 * 1024 * 1024 * 1024)).toBe('3.00 GB');
    });
});
