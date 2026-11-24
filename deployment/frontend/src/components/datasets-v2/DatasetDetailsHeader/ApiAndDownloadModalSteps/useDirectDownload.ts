import { type Resource } from '@/interfaces/dataset.interface';
import { api } from '@/utils/api';
import { useState } from 'react';

const CONTROL_CHARS_RE = /[\x00-\x1F\x7F]/g;
const PATH_SEPARATORS_RE = /[\\/]/g;
const WINDOWS_RESERVED_RE = /[<>:"|?*]/g;
const MULTI_DOTS_RE = /\.\.+/g;

function sanitizeFilenamePart(value: string): string {
    return value
        .replace(CONTROL_CHARS_RE, '')
        .replace(PATH_SEPARATORS_RE, '_')
        .replace(WINDOWS_RESERVED_RE, '_')
        .replace(MULTI_DOTS_RE, '_')
        .trim()
        .replace(/^\.+/, '')
        .replace(/[.\s]+$/, '');
}

function getResourceFilename(resource: Resource, index: number): string {
    const fallbackBase = `file-${index + 1}`;
    const rawBase = resource.name?.trim() ?? resource.title?.trim() ?? fallbackBase;
    const sanitizedBase = sanitizeFilenamePart(rawBase) || fallbackBase;

    // Keep an existing extension from the source filename when available.
    const hasExtension = /\.[A-Za-z0-9]{1,16}$/.test(sanitizedBase);
    if (hasExtension) {
        return sanitizedBase;
    }

    const sanitizedFormat = sanitizeFilenamePart(resource.format?.toLowerCase() ?? '');
    const ext = sanitizedFormat ? `.${sanitizedFormat}` : '';
    return `${sanitizedBase}${ext}`;
}

/**
 * Ask the browser to save the file instead of navigating to it.
 *
 * `target="_blank"` used to be set here, which defeated the purpose: the
 * `download` attribute is only honoured for same-origin navigations, so with
 * `_blank` the browser navigated to the presigned S3 URL instead. S3 answered
 * with its own `Content-Type` and no `Content-Disposition`, so Chrome downloaded
 * the file *and* left a blank tab open behind it.
 *
 * Without `target` the click stays in the current document and `download` can do
 * its job. For cross-origin URLs the attribute is ignored by design, so the
 * filename is also forced server-side through `ResponseContentDisposition` in
 * `uploads.getPresignedUrl` (DX S3 uploads).
 */
function triggerAnchorDownload(url: string, filename: string) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

export type DownloadState = 'idle' | 'loading' | 'done' | 'error';

/**
 * Browsers throttle burst of programmatic downloads (Chrome allows ~10 per user
 * gesture and then asks for permission / silently drops the rest). Spacing the
 * anchors keeps every file of a large selection reachable.
 */
const DOWNLOAD_STAGGER_MS = 400;

function delay(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Downloads the selected files straight to the browser — one request per file,
 * no ZIP. The only ZIP in the product is the server-side one used for Data API
 * tile sets, which are delivered by email instead.
 */
export function useDirectDownload() {
    const utils = api.useUtils();
    const [state, setState] = useState<DownloadState>('idle');

    const download = async (resources: Resource[]) => {
        if (resources.length === 0) return;
        setState('loading');

        try {
            // Resolve a download URL for each resource.
            const resolved = await Promise.all(
                resources.map(async (resource, index) => {
                    const filename = getResourceFilename(resource, index);

                    if (resource.key) {
                        // DX S3 upload – obtain a presigned URL. The filename is
                        // passed so S3 answers with `Content-Disposition:
                        // attachment`; without it the browser would navigate to
                        // the object (leaving a blank tab) instead of saving it.
                        const signedUrl = await utils.uploads.getPresignedUrl.fetch({
                            key: resource.key,
                            filename,
                        });
                        return { filename, url: signedUrl };
                    }

                    if (resource.url) {
                        // Non-DX S3 or any external file – download as-is.
                        return { filename, url: resource.url };
                    }

                    throw new Error(`Resource "${filename}" has no download URL.`);
                })
            );

            // Never ZIP in the browser: each selected file is downloaded on its
            // own. The only ZIP in the product is the server-side one used for
            // Data API tile sets, which are delivered by email instead.
            for (const { url, filename } of resolved) {
                triggerAnchorDownload(url, filename);
                await delay(DOWNLOAD_STAGGER_MS);
            }

            setState('done');
        } catch (err) {
            console.error('Download failed:', err);
            setState('error');
        }
    };

    return { download, state };
}
