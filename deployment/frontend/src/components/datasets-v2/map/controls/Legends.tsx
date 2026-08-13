import { useState } from 'react';
import { useLayerGroupsFromRW } from '@/utils/queryHooks';
import { useActiveLayerGroups, useLayerStates } from '@/utils/storeHooks';
import { type APILayerSpec } from '@/interfaces/layer.interface';
import { type ActiveLayerGroup } from '@/interfaces/state.interface';
import {
    Button,
    LayerParameters,
    Modal,
    OpacityControl,
    ScaleBar,
    Select,
    getThemedColor,
    getThemedFontSize,
    getThemedLineHeight,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    EyeIcon,
    EyeSlashIcon,
    Square3Stack3DIcon,
} from '@heroicons/react/24/solid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import LegendItemTypesList from '@/components/vizzuality/components/legend/components/legend-item-types/LegendItemTypesList';

type ThresholdOption = {
    label: string;
    value: number;
};

type ThresholdParamOption = {
    label?: string;
    value?: number | string;
};

type ThresholdParam = {
    key?: string;
    default?: number | string;
    options?: ThresholdParamOption[];
};

type LegendRow = {
    id: string;
    title: string;
    subtitle: string;
    hidden: boolean;
    layers: APILayerSpec[];
    activeLayer: APILayerSpec;
    thresholdOptions: ThresholdOption[];
    selectedThreshold: number;
    showLegendTypes: boolean;
    showScale: boolean;
    scaleColors: string[];
    scaleValues: string[];
    showLayerParameters: boolean;
};

type RWLayerGroup = {
    dataset: string;
    layers: APILayerSpec[];
};

function LegendsWri() {
    const { data: layerGroups } = useLayerGroupsFromRW();
    const { activeLayerGroups, replaceLayersGroups } = useActiveLayerGroups();
    const { currentLayers, updateLayerState } = useLayerStates();
    const [legendCollapsed, setLegendCollapsed] = useState(false);
    const [selectedLayerForDetails, setSelectedLayerForDetails] = useState<APILayerSpec | null>(
        null
    );

    const typedLayerGroups = (layerGroups ?? []) as RWLayerGroup[];

    const getThresholdData = (
        layer: APILayerSpec
    ): { options: ThresholdOption[]; selected: number } => {
        const rawParamsConfig = layer.layerConfig?.params_config;
        const paramsConfig: ThresholdParam[] = Array.isArray(rawParamsConfig)
            ? (rawParamsConfig as ThresholdParam[])
            : [];

        const threshold = paramsConfig.find(
            (item) => item?.key === 'thresh' || item?.key === 'threshold'
        );

        if (!threshold) {
            return { options: [], selected: 20 };
        }

        const options = Array.isArray(threshold.options)
            ? threshold.options
                  .map((option) => ({
                      label: String(option.label ?? option.value ?? ''),
                      value: Number(option.value),
                  }))
                  .filter((option) => Number.isFinite(option.value))
            : [10, 15, 20, 25, 30, 50, 75].map((value) => ({
                  label: `>${value}%`,
                  value,
              }));

        const selectedFromState = currentLayers.get(layer.id)?.threshold;
        const selectedFromDefault = Number(threshold.default);
        const selected =
            typeof selectedFromState === 'number'
                ? selectedFromState
                : Number.isFinite(selectedFromDefault)
                  ? selectedFromDefault
                  : (options[0]?.value ?? 20);

        return { options, selected };
    };

    const legends: LegendRow[] = typedLayerGroups
        .filter((group) => group.layers?.length > 0)
        .map((group): LegendRow | null => {
            const titleLayer =
                group.layers.find((layer) => currentLayers.get(layer.id)?.active) ??
                group.layers[0];
            if (!titleLayer) return null;

            const subtitle =
                typeof titleLayer?.legendConfig?.unit === 'string' &&
                titleLayer.legendConfig.unit.length > 0
                    ? titleLayer.legendConfig.unit
                    : typeof titleLayer?.legendConfig?.type === 'string' &&
                        titleLayer.legendConfig.type.length > 0
                      ? titleLayer.legendConfig.type
                      : 'Layer';

            const hidden = !group.layers.some((layer) => {
                const layerState = currentLayers.get(layer.id);
                const isActive = typeof layerState?.active === 'boolean' ? layerState.active : true;
                const isVisible =
                    typeof layerState?.visibility === 'boolean'
                        ? layerState.visibility
                        : Boolean(layer.default);

                return isActive && isVisible;
            });

            const thresholdData = getThresholdData(titleLayer);
            const rawLegendConfig = titleLayer?.legendConfig as {
                type?: string;
                colors?: unknown;
                values?: unknown;
            };

            const supportedLegendTypes = [
                'multiple',
                'basic',
                'choropleth',
                'gradient',
                'proportional',
            ];
            const showLegendTypes =
                typeof rawLegendConfig?.type === 'string' &&
                supportedLegendTypes.includes(rawLegendConfig.type);

            const scaleColors = Array.isArray(rawLegendConfig?.colors)
                ? rawLegendConfig.colors.filter(
                      (color): color is string => typeof color === 'string' && color.length > 0
                  )
                : [];

            const scaleValues = Array.isArray(rawLegendConfig?.values)
                ? rawLegendConfig.values
                      .map((value) => String(value ?? '').trim())
                      .filter((value) => value.length > 0)
                : [];

            // Use ScaleBar only as fallback when no supported legend type exists.
            const showScale = !showLegendTypes && scaleColors.length > 1 && scaleValues.length > 1;

            return {
                id: group.dataset,
                title: titleLayer?.name ?? 'Layer',
                subtitle,
                hidden,
                layers: group.layers,
                activeLayer: titleLayer,
                thresholdOptions: thresholdData.options,
                selectedThreshold: thresholdData.selected,
                showLegendTypes,
                showScale,
                scaleColors,
                scaleValues,
                showLayerParameters: thresholdData.options.length > 0,
            };
        })
        .filter((legend): legend is LegendRow => Boolean(legend));

    function moveLayerGroup(datasetId: string, direction: 'up' | 'down') {
        const index = activeLayerGroups.findIndex((group) => group.datasetId === datasetId);
        if (index < 0) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= activeLayerGroups.length) return;

        const next = [...activeLayerGroups];
        const current = next[index];
        const target = next[newIndex];
        if (!current || !target) return;

        next[index] = target;
        next[newIndex] = current;

        const isActiveLayerGroup = (
            item: ActiveLayerGroup | undefined
        ): item is ActiveLayerGroup => {
            return !!item;
        };

        replaceLayersGroups(next.filter(isActiveLayerGroup));
    }

    function toggleLayerGroupVisibility(legend: LegendRow) {
        const nextVisibility = legend.hidden;

        legend.layers.forEach((layer) => {
            updateLayerState(layer.id, 'active', true);
            updateLayerState(layer.id, 'visibility', nextVisibility);
        });
    }

    const trimmedDescription = selectedLayerForDetails?.description?.trim();
    const detailsDescription =
        trimmedDescription && trimmedDescription.length > 0
            ? trimmedDescription
            : 'No description available.';

    const formatDate = (value?: string) => {
        if (!value) return 'Not available';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Not available';

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Modal
                open={Boolean(selectedLayerForDetails)}
                onClose={() => setSelectedLayerForDetails(null)}
                size="small"
                header="Layer details"
                content={
                    <div
                        style={{
                            padding: getThemedSpacing(300),
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemedSpacing(400),
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: getThemedFontSize(500),
                                lineHeight: getThemedLineHeight(700),
                                color: getThemedColor('neutral', 900),
                            }}
                        >
                            {detailsDescription}
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                gap: getThemedSpacing(1200),
                                flexWrap: 'wrap',
                            }}
                        >
                            <div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: getThemedFontSize(300),
                                        lineHeight: getThemedLineHeight(500),
                                        fontWeight: 700,
                                        color: getThemedColor('neutral', 800),
                                    }}
                                >
                                    Created
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: getThemedFontSize(300),
                                        lineHeight: getThemedLineHeight(500),
                                        color: getThemedColor('neutral', 700),
                                    }}
                                >
                                    {formatDate(selectedLayerForDetails?.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: getThemedFontSize(300),
                                        lineHeight: getThemedLineHeight(500),
                                        fontWeight: 700,
                                        color: getThemedColor('neutral', 800),
                                    }}
                                >
                                    Last updated
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: getThemedFontSize(300),
                                        lineHeight: getThemedLineHeight(500),
                                        color: getThemedColor('neutral', 700),
                                    }}
                                >
                                    {formatDate(selectedLayerForDetails?.updatedAt)}
                                </p>
                            </div>
                        </div>

                        {selectedLayerForDetails?.connectorUrl && (
                            <div>
                                <a
                                    href={selectedLayerForDetails.connectorUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        fontSize: getThemedFontSize(300),
                                        color: getThemedColor('primary', 700),
                                    }}
                                >
                                    View source metadata
                                </a>
                            </div>
                        )}
                    </div>
                }
            />

            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: 300,
                    zIndex: 1000,
                    margin: getThemedSpacing(400),
                    background: getThemedColor('neutral', 100),
                    border: `1px solid ${getThemedColor('neutral', 300)}`,
                    borderRadius: getThemedRadius(300),
                    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                }}
            >
                <button
                    type="button"
                    onClick={() => setLegendCollapsed((prev) => !prev)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: getThemedSpacing(200),
                        border: 0,
                        borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
                        background: getThemedColor('neutral', 100),
                        padding: `${getThemedSpacing(200)} ${getThemedSpacing(300)}`,
                        cursor: 'pointer',
                    }}
                >
                    <Square3Stack3DIcon
                        style={{ width: 16, height: 16, color: getThemedColor('neutral', 700) }}
                    />
                    <span
                        style={{
                            flex: 1,
                            textAlign: 'left',
                            fontSize: getThemedFontSize(400),
                            lineHeight: getThemedLineHeight(600),
                            fontWeight: 700,
                            color: getThemedColor('neutral', 800),
                        }}
                    >
                        Legend
                    </span>
                    {legendCollapsed ? (
                        <ChevronDownIcon
                            style={{ width: 16, height: 16, color: getThemedColor('neutral', 700) }}
                        />
                    ) : (
                        <ChevronUpIcon
                            style={{ width: 16, height: 16, color: getThemedColor('neutral', 700) }}
                        />
                    )}
                </button>

                {!legendCollapsed && (
                    <div
                        style={{
                            maxHeight: 452,
                            overflowY: 'auto',
                            background: getThemedColor('neutral', 100),
                        }}
                    >
                        {legends.map((legend, index) => {
                            const stateOpacity = currentLayers.get(legend.activeLayer.id)?.opacity;
                            const layerOpacity = legend.activeLayer.layerConfig.opacity;
                            const resolvedOpacity =
                                typeof stateOpacity === 'number'
                                    ? stateOpacity
                                    : typeof layerOpacity === 'number'
                                      ? layerOpacity
                                      : 1;

                            return (
                                <div
                                    key={legend.id}
                                    style={{
                                        borderBottom:
                                            index < legends.length - 1
                                                ? `1px solid ${getThemedColor('neutral', 300)}`
                                                : 'none',
                                        padding: `${getThemedSpacing(300)} ${getThemedSpacing(300)} ${getThemedSpacing(500)}`,
                                        display: 'flex',
                                        gap: getThemedSpacing(300),
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    {legends.length > 1 && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: getThemedSpacing(200),
                                                paddingTop: getThemedSpacing(100),
                                            }}
                                        >
                                            <Button
                                                variant="borderless"
                                                size="small"
                                                aria-label="Move layer up"
                                                onClick={() => moveLayerGroup(legend.id, 'up')}
                                                leftIcon={
                                                    <ChevronUpIcon
                                                        style={{ width: 20, height: 20 }}
                                                    />
                                                }
                                            />
                                            <Button
                                                variant="borderless"
                                                size="small"
                                                aria-label="Move layer down"
                                                onClick={() => moveLayerGroup(legend.id, 'down')}
                                                leftIcon={
                                                    <ChevronDownIcon
                                                        style={{ width: 20, height: 20 }}
                                                    />
                                                }
                                            />
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: getThemedSpacing(400),
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: getThemedSpacing(200),
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: getThemedFontSize(400),
                                                        lineHeight: getThemedLineHeight(600),
                                                        color: getThemedColor('neutral', 900),
                                                    }}
                                                >
                                                    {legend.title}
                                                </p>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: getThemedFontSize(300),
                                                        lineHeight: getThemedLineHeight(500),
                                                        color: getThemedColor(
                                                            'neutral',
                                                            legend.hidden ? 700 : 800
                                                        ),
                                                    }}
                                                >
                                                    {legend.subtitle}
                                                </p>
                                            </div>

                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => toggleLayerGroupVisibility(legend)}
                                                leftIcon={
                                                    legend.hidden ? (
                                                        <EyeSlashIcon
                                                            style={{ width: 10, height: 10 }}
                                                        />
                                                    ) : (
                                                        <EyeIcon
                                                            style={{ width: 10, height: 10 }}
                                                        />
                                                    )
                                                }
                                            >
                                                {legend.hidden ? 'Show' : 'Hide'}
                                            </Button>
                                        </div>

                                        {legend.showLegendTypes && (
                                            <LegendItemTypesList activeLayer={legend.activeLayer} />
                                        )}

                                        {legend.showScale && (
                                            <ScaleBar
                                                isGradient
                                                colors={legend.scaleColors}
                                                values={legend.scaleValues}
                                            />
                                        )}

                                        {legend.showLayerParameters && (
                                            <LayerParameters
                                                label="Adjust layer parameters"
                                                openedByDefault
                                            >
                                                <div
                                                    style={{
                                                        padding: `${getThemedSpacing(300)} ${getThemedSpacing(200)}`,
                                                    }}
                                                >
                                                    <Select
                                                        label="Probability threshold"
                                                        size="small"
                                                        items={legend.thresholdOptions.map(
                                                            (option) => ({
                                                                value: String(option.value),
                                                                label: option.label,
                                                            })
                                                        )}
                                                        value={[String(legend.selectedThreshold)]}
                                                        onChange={(value) => {
                                                            const selected = Number(value[0]);
                                                            if (!Number.isFinite(selected)) return;

                                                            updateLayerState(
                                                                legend.activeLayer.id,
                                                                'active',
                                                                true
                                                            );
                                                            updateLayerState(
                                                                legend.activeLayer.id,
                                                                'threshold',
                                                                selected
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </LayerParameters>
                                        )}

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: getThemedSpacing(300),
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                leftIcon={
                                                    <InformationCircleIcon
                                                        style={{ width: 10, height: 10 }}
                                                    />
                                                }
                                                onClick={() =>
                                                    setSelectedLayerForDetails(legend.activeLayer)
                                                }
                                            >
                                                Layer details
                                            </Button>
                                            <OpacityControl
                                                defaultValue={Math.round(resolvedOpacity * 100)}
                                                onOpacityChanged={(value: number) => {
                                                    updateLayerState(
                                                        legend.activeLayer.id,
                                                        'active',
                                                        true
                                                    );
                                                    updateLayerState(
                                                        legend.activeLayer.id,
                                                        'opacity',
                                                        value / 100
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {layerGroups && legends.length === 0 && (
                            <div
                                style={{
                                    padding: getThemedSpacing(300),
                                    color: getThemedColor('neutral', 700),
                                    fontSize: getThemedFontSize(300),
                                }}
                            >
                                No legend layers available.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export { LegendsWri, LegendsWri as Legends };
