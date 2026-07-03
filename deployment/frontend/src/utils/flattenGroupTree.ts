import { type GroupTree, type GroupsmDetails } from '@/schema/ckan.schema';

export function flattenTree(tree: GroupTree[]): Record<string, number> {
    const counts: Record<string, number> = {};

    function helper(node: GroupTree): number {
        let count = node.children.length;
        for (const child of node.children) {
            count += helper(child);
        }
        counts[node.name] = count;
        return count;
    }

    for (const node of tree) {
        helper(node);
    }

    return counts;
}

export function collectGroupTreeImages(
    nodes: GroupTree[],
    acc: Record<string, string> = {}
): Record<string, string> {
    for (const node of nodes) {
        if (node.image_display_url) {
            acc[node.id] = node.image_display_url;
        }
        if (node.children?.length) {
            collectGroupTreeImages(node.children, acc);
        }
    }
    return acc;
}

export function collectGroupDetails(
    nodes: GroupTree[],
    acc: Record<string, GroupsmDetails> = {}
): Record<string, GroupsmDetails> {
    for (const node of nodes) {
        const extended = node as GroupTree & { package_count?: number };
        acc[node.id] = {
            img_url: extended.image_display_url ?? '',
            description: extended.description ?? extended.notes ?? '',
            notes: extended.notes,
            package_count: extended.package_count ?? 0,
            name: node.name,
            visibility: node.visibility,
        };
        if (node.children?.length) {
            collectGroupDetails(node.children, acc);
        }
    }
    return acc;
}
