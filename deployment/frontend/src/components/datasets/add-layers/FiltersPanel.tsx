import Facet from '@/components/search/Facet';
import FiltersSelected from '@/components/search/FiltersSelected';
import LocationSearch from '@/components/search/LocationSearch';
import MetadataModifiedFacet from '@/components/search/MetadataModifiedFacet';
import TemporalCoverageFacet from '@/components/search/TemporalCoverageFacet';
import { type Filter } from '@/interfaces/search.interface';
import { type SearchInput } from '@/schema/search.schema';
import { api } from '@/utils/api';
import { updateFrequencyLabels, visibilityTypeLabels } from '@/utils/constants';
import { useSession } from 'next-auth/react';
import {
    type Dispatch,
    type SetStateAction,
    useMemo,
} from 'react';

const BASE_FACET_FIELDS = [
    { key: 'featured_dataset', title: 'Featured' },
    { key: 'application', title: 'Application' },
    { key: 'project', title: 'Project' },
    { key: 'organization', title: 'Team' },
    { key: 'groups', title: 'Topics' },
    { key: 'tags', title: 'Tags' },
    {
        key: 'temporal_coverage',
        title: 'Temporal Coverage',
    },
    { key: 'update_frequency', title: 'Update Frequency' },
    { key: 'res_format', title: 'Format' },
    { key: 'license_id', title: 'License' },
    { key: 'language', title: 'Language' },
    { key: 'wri_data', title: 'WRI Data' },
    { key: 'metadata_modified', title: 'Last Updated' },
] as const;

export default function FiltersPanel({
    filters,
    setFilters,
}: {
    filters: Filter[];
    setFilters: Dispatch<SetStateAction<Filter[]>>;
}) {
    const session = useSession();
    const isAuthenticated = session.status === 'authenticated';
    const sessionReady = session.status !== 'loading';

    /*
     * Query used to fetch all possible facet options.
     * Rebuild when auth settles so visibility_type is included for signed-in users.
     */
    const facetFields = useMemo(() => {
        const fields: { key: string; title: string }[] = [...BASE_FACET_FIELDS];
        if (isAuthenticated) {
            fields.push({ key: 'visibility_type', title: 'Visibility' });
        }
        return fields;
    }, [isAuthenticated]);

    const facetsQuery = useMemo<SearchInput>(
        () => ({
            search: '',
            page: { start: 0, rows: 0 },
            facetFields: facetFields.map((ff) => ff.key),
        }),
        [facetFields]
    );

    const { data: facetsData, isLoading: isLoadingFacets } =
        api.dataset.getAllDataset.useQuery(facetsQuery, {
            staleTime: 10 * 60 * 1000,
            enabled: sessionReady,
        });

    const searchFacets = facetsData?.searchFacets;

    if (searchFacets) {
        for (const key in searchFacets) {
            /*
             * Boolean fields look better with Yes and No options
             *
             */
            if (['featured_dataset', 'wri_data'].includes(key)) {
                const items =
                    searchFacets[key]?.items.map((i) => ({
                        ...i,
                        display_name: i.name == 'true' ? 'Yes' : 'No',
                    })) || [];

                // @ts-ignore
                searchFacets[key].items = items;
            } else if (key == 'visibility_type') {
                // @ts-ignore
                searchFacets[key].items = searchFacets[key].items.map((i) => ({
                    ...i,
                    // @ts-ignore
                    display_name: visibilityTypeLabels[i.name],
                }));
            } else if (key == 'update_frequency') {
                // @ts-ignore
                searchFacets[key].items = searchFacets[key].items.map((i) => ({
                    ...i,
                    // @ts-ignore
                    display_name: updateFrequencyLabels[i.name],
                }));
            }
        }
    }
    return (
        <div className="mt-6 pr-6">
            <FiltersSelected filters={filters} setFilters={setFilters} />
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white pb-4 mt-4">
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list">
                                <LocationSearch
                                    filters={filters}
                                    setFilters={setFilters}
                                />
                                {!isLoadingFacets &&
                                    facetFields.map((ff) =>
                                        ff.key === 'temporal_coverage' ? (
                                            <TemporalCoverageFacet
                                                filters={filters}
                                                setFilters={setFilters}
                                            />
                                        ) : ff.key === 'metadata_modified' ? (
                                            <MetadataModifiedFacet
                                                filters={filters}
                                                setFilters={setFilters}
                                            />
                                        ) : (
                                            <Facet
                                                text={ff.title}
                                                options={
                                                    searchFacets?.[ff.key]
                                                        ? searchFacets[
                                                              ff.key
                                                          ]?.items
                                                              .filter(
                                                                  (o) => o.name
                                                              )
                                                              .map((o) => ({
                                                                  label:
                                                                      o.display_name ??
                                                                      o.name,
                                                                  value: o.name,
                                                              })) || []
                                                        : []
                                                }
                                                fqKey={ff.key}
                                                setFilters={setFilters}
                                                filters={filters}
                                            />
                                        )
                                    )}
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}
