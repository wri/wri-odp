import { describe, expect, it } from 'vitest';
import {
    getResourceOrdinal,
    isDataFileResource,
    isLayerResource,
    reorderResourceSubset,
} from '../src/utils/datasetResources';

describe('datasetResources', () => {
    const resources = [
        { type: 'upload', title: 'file-a' },
        { type: 'layer', title: 'layer-a' },
        { type: 'link', title: 'file-b' },
        { type: 'reference-layer', title: 'layer-b' },
        { type: 'layer-raw', title: 'layer-c' },
    ];

    it('classifies reference-layer as a layer, not a data file', () => {
        expect(isLayerResource({ type: 'reference-layer' })).toBe(true);
        expect(isDataFileResource({ type: 'reference-layer' })).toBe(false);
        expect(isLayerResource({ url_type: 'reference-layer' })).toBe(true);
    });

    it('reorders only layers without moving data files', () => {
        const reordered = reorderResourceSubset(
            resources,
            isLayerResource,
            0,
            2
        );

        expect(reordered.map((r) => r.title)).toEqual([
            'file-a',
            'layer-b',
            'file-b',
            'layer-c',
            'layer-a',
        ]);
    });

    it('reorders only data files without moving layers', () => {
        const reordered = reorderResourceSubset(
            resources,
            isDataFileResource,
            0,
            1
        );

        expect(reordered.map((r) => r.title)).toEqual([
            'file-b',
            'layer-a',
            'file-a',
            'layer-b',
            'layer-c',
        ]);
    });

    it('numbers layers and data files by subset ordinal', () => {
        expect(getResourceOrdinal(resources, 1, isLayerResource)).toBe(1);
        expect(getResourceOrdinal(resources, 3, isLayerResource)).toBe(2);
        expect(getResourceOrdinal(resources, 2, isDataFileResource)).toBe(2);
    });
});
