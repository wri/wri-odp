/**
 * Hosts that `next/image` is allowed to optimize. This must stay in sync with
 * `images.domains` in next.config.mjs — `tests/imageHosts.test.ts` enforces it.
 *
 * CKAN stores arbitrary `image_url` values (seeded fixtures, legacy records), so
 * components must never hand an unlisted host to `next/image`: it throws during
 * render and takes the whole page down.
 */
export const allowedImageHosts: readonly string[] = [
    'wri-dev-ckan-svc',
    'datasets-dev.wri.org',
    'datasets-staging.wri.org',
    'datasets.wri.org',
    'test-bucket-wri.s3.ap-northeast-1.amazonaws.com',
    'ckan-dev',
    'ckan',
    'gravatar.com',
    's3.amazonaws.com',
    'picsum.photos',
    'placeimg.com',
    'dummyimage.com',
];

export function isAllowedImageSrc(src: string): boolean {
    if (src.startsWith('/')) return true;
    if (src.startsWith('data:') || src.startsWith('blob:')) return true;

    try {
        return allowedImageHosts.includes(new URL(src).hostname);
    } catch {
        return false;
    }
}

/**
 * Returns `src` when `next/image` can render it, otherwise `fallback`.
 */
export function getSafeImageSrc(
    src: string | null | undefined,
    fallback: string
): string {
    if (!src) return fallback;
    return isAllowedImageSrc(src) ? src : fallback;
}
