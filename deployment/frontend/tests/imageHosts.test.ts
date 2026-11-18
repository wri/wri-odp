import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { allowedImageHosts, getSafeImageSrc } from '../src/utils/imageHosts';

// next.config.mjs is not importable here (it awaits src/env.mjs, which needs the
// full env), so the domains list is read from source instead.
const nextConfigSource = readFileSync(
    join(__dirname, '../next.config.mjs'),
    'utf-8'
);
const domainsBlock = nextConfigSource.match(/domains:\s*\[([\s\S]*?)\]/);
const configuredDomains = (domainsBlock?.[1] ?? '')
    .split(',')
    .map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

describe('imageHosts', () => {
    it('mirrors the images.domains list in next.config.mjs', () => {
        expect(configuredDomains.length).toBeGreaterThan(0);
        expect([...allowedImageHosts].sort()).toEqual(
            [...configuredDomains].sort()
        );
    });

    it('keeps local and inline sources untouched', () => {
        expect(getSafeImageSrc('/images/logo.png', '/fallback.png')).toBe(
            '/images/logo.png'
        );
        expect(getSafeImageSrc('data:image/png;base64,abc', '/f.png')).toBe(
            'data:image/png;base64,abc'
        );
    });

    it('replaces unconfigured hosts with the fallback', () => {
        expect(
            getSafeImageSrc('https://placekitten.com/120/707', '/fallback.png')
        ).toBe('/fallback.png');
        expect(
            getSafeImageSrc('https://not-a-real-host.test/a.png', '/f.png')
        ).toBe('/f.png');
    });

    it('keeps configured hosts', () => {
        expect(
            getSafeImageSrc('https://gravatar.com/avatar/abc', '/f.png')
        ).toBe('https://gravatar.com/avatar/abc');
        expect(
            getSafeImageSrc('https://dummyimage.com/120/707', '/f.png')
        ).toBe('https://dummyimage.com/120/707');
    });

    it('falls back for empty or malformed values', () => {
        expect(getSafeImageSrc('', '/f.png')).toBe('/f.png');
        expect(getSafeImageSrc(undefined, '/f.png')).toBe('/f.png');
        expect(getSafeImageSrc('not a url', '/f.png')).toBe('/f.png');
    });
});
