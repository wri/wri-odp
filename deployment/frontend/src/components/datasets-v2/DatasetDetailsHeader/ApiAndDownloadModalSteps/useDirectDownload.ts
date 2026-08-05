import { type Resource } from '@/interfaces/dataset.interface';
import { api } from '@/utils/api';
import JSZip from 'jszip';
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

function triggerAnchorDownload(url: string, filename: string) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

export type DownloadState = 'idle' | 'loading' | 'done' | 'error';

export function useDirectDownload(datasetName: string) {
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
                        // S3 upload – obtain a presigned URL.
                        const signedUrl = await utils.uploads.getPresignedUrl.fetch({
                            key: resource.key,
                        });
                        return { filename, url: signedUrl };
                    }

                    if (resource.url) {
                        return { filename, url: resource.url };
                    }

                    throw new Error(`Resource "${filename}" has no download URL.`);
                })
            );

            if (resolved.length === 1) {
                // Single file — direct download.
                const { url, filename } = resolved[0]!;
                triggerAnchorDownload(url, filename);
                setState('done');
                return;
            }

            // Multiple files — build a ZIP.
            const zip = new JSZip();

            await Promise.all(
                resolved.map(async ({ url, filename }) => {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch "${filename}" (${response.status})`);
                    }
                    const blob = await response.blob();
                    zip.file(filename, blob);
                })
            );

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(zipBlob);
            triggerAnchorDownload(zipUrl, `${datasetName}-download.zip`);
            URL.revokeObjectURL(zipUrl);
            setState('done');
        } catch (err) {
            console.error('Download failed:', err);
            setState('error');
        }
    };

    return { download, state };
}
