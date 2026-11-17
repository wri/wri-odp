import { describe, expect, it } from 'vitest';
import {
    getCopyLinkValue,
    getDataApiTileGfwUrls,
    getResourceFormatLabel,
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
