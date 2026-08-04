const LAYER_TYPES = [
    'layer',
    'layer-raw',
    'empty-layer',
    'reference-layer',
] as const;

type ResourceLike = { type?: string | null; url_type?: string | null };

export function getResourceType(resource: ResourceLike): string | null | undefined {
    return resource.type ?? resource.url_type;
}

export function isLayerResource(resource: ResourceLike): boolean {
    const type = getResourceType(resource);
    return LAYER_TYPES.includes(type as (typeof LAYER_TYPES)[number]);
}

export function isDataFileResource(resource: ResourceLike): boolean {
    return !isLayerResource(resource);
}

export function getResourceIndices(
    resources: ResourceLike[],
    predicate: (resource: ResourceLike) => boolean
): number[] {
    return resources
        .map((resource, index) => (predicate(resource) ? index : -1))
        .filter((index) => index !== -1);
}

/** Reorder items matching predicate by visual indices, keeping others in place. */
export function reorderResourceSubset<T extends ResourceLike>(
    resources: T[],
    predicate: (resource: T) => boolean,
    oldIdx: number,
    newIdx: number
): T[] {
    if (oldIdx === newIdx) return resources;

    const indices = getResourceIndices(resources, predicate);
    if (
        oldIdx < 0 ||
        newIdx < 0 ||
        oldIdx >= indices.length ||
        newIdx >= indices.length
    ) {
        return resources;
    }

    const subset = indices.map((index) => resources[index]!);
    const [moved] = subset.splice(oldIdx, 1);
    subset.splice(newIdx, 0, moved!);

    const next = [...resources];
    indices.forEach((resourceIndex, i) => {
        next[resourceIndex] = subset[i]!;
    });
    return next;
}

export function getResourceOrdinal(
    resources: ResourceLike[],
    index: number,
    predicate: (resource: ResourceLike) => boolean
): number {
    return resources.slice(0, index + 1).filter(predicate).length;
}
