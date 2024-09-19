import { GroupTree } from "@/schema/ckan.schema";

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
