import { type ReactNode } from 'react';
import {
    UserIcon,
    GlobeAltIcon,
    CalendarIcon,
    InformationCircleIcon,
    Square3Stack3DIcon,
    UserCircleIcon,
} from '@heroicons/react/24/solid';
import {
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import type { WriDataset } from '@/schema/ckan.schema';

function DatasetTable({
    datasetId: _datasetId,
    licenseTitle,
    dataset,
}: {
    datasetId: string;
    licenseTitle: string;
    dataset?: WriDataset;
}) {
    const getExtraValue = (keys: string[]) => {
        if (!dataset?.extras?.length) return undefined;

        const normalizedKeys = keys.map((k) => k.toLowerCase());
        const extra = dataset.extras.find((item) =>
            normalizedKeys.includes(item.key.toLowerCase())
        );

        return extra?.value;
    };

    const temporalCoverage = [dataset?.temporal_coverage_start, dataset?.temporal_coverage_end]
        .filter(Boolean)
        .join(' - ');

    const rows: Array<{ icon: typeof UserIcon; label: string; value?: ReactNode }> = [
        {
            icon: UserIcon,
            label: 'Team',
            value: dataset?.organization?.title,
        },
        {
            icon: GlobeAltIcon,
            label: 'Geographic coverage',
            value:
                getExtraValue([
                    'geographic_coverage',
                    'geographic coverage',
                    'location_coverage',
                    'spatial_coverage',
                ]) ?? dataset?.spatial_address,
        },
        {
            icon: CalendarIcon,
            label: 'Temporal coverage',
            value: temporalCoverage || undefined,
        },

        {
            icon: Square3Stack3DIcon,
            label: 'Dataset type',
            value:
                getExtraValue(['dataset_type', 'dataset type']) ??
                (dataset?.type && dataset.type !== 'dataset' ? dataset.type : undefined),
        },

        {
            icon: UserCircleIcon,
            label: 'License',
            value: licenseTitle,
        },
        {
            icon: InformationCircleIcon,
            label: 'Spatial resolution',
            value: getExtraValue(['spatial_resolution', 'spatial resolution']),
        },
        {
            icon: InformationCircleIcon,
            label: 'Tree cover scale',
            value: getExtraValue(['tree_cover_scale', 'tree cover scale']),
        },
    ].filter((row) => !!row.value);
    return (
        <div
            style={{
                padding: getThemedSpacing(700),
            }}
        >
            <h2
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                }}
            >
                Key details
            </h2>

            <div className="divide-y divide-neutral-200">
                {rows.map(({ icon: Icon, label, value }) => (
                    <div
                        key={label}
                        className="grid grid-cols-[24px_1fr] gap-x-4 gap-y-2 py-5 sm:grid-cols-[24px_220px_1fr] sm:items-center sm:gap-x-6"
                    >
                        <Icon
                            className="h-6 w-6"
                            style={{ color: getThemedColor('secondary', 700) }}
                        />
                        <div className="font-semibold sm:font-normal">{label}</div>
                        <div className="col-start-2 break-words sm:col-start-auto">{value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DatasetTable;
