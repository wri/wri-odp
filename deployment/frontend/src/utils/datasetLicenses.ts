export const datasetLicenses = [
    { id: 'notspecified', title: 'License not specified', url: '' },
    {
        id: 'cc-zero-1-0',
        title: 'Creative Commons CC0 1.0 (Public Domain)',
        url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    {
        id: 'cc-by-4-0',
        title: 'Creative Commons Attribution 4.0',
        url: 'https://creativecommons.org/licenses/by/4.0/',
    },
    {
        id: 'cc-by-sa-4-0',
        title: 'Creative Commons Attribution-ShareAlike 4.0',
        url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
    { id: 'other-open', title: 'Other (Open)', url: '' },
    {
        id: 'cc-by-nc-4-0',
        title: 'Creative Commons Attribution-NonCommercial 4.0',
        url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    },
    { id: 'other-closed', title: 'Other (Not Open)', url: '' },
    {
        id: 'cc-by-nc-sa-4-0',
        title: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0',
        url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    },
] as const;

export const datasetLicenseOptions = datasetLicenses.map((license) => ({
    value: license.id,
    label: license.title,
}));

export function getDatasetLicense(dataset: {
    license_type_id?: string | null;
    license_title?: string | null;
    license_url?: string | null;
}) {
    if (dataset.license_type_id) {
        return datasetLicenses.find((license) => license.id === dataset.license_type_id);
    }
    // returns legacy version of license type
    if (!dataset.license_title) return undefined;

    return {
        title: dataset.license_title,
        url: /^https?:\/\//i.test(dataset.license_url ?? '') ? dataset.license_url! : '',
    };
}
