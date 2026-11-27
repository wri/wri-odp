import { useState } from 'react';
import { ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    List,
    Modal,
    Panel,
} from '@worldresources/wri-design-systems';
import { NumberIcon } from './NumberIcon';
import { AccessApiModalContent } from './AccessApiButton';
import ConfirmationStep from './ApiAndDownloadModalSteps/ConfirmationStep';
import ReviewCautionStep from './ApiAndDownloadModalSteps/ReviewCautionStep';
import ReviewDetailsAndTermsStep, {
    type ReviewDetailsAndTermsFormData,
} from './ApiAndDownloadModalSteps/ReviewDetailsAndTermsStep';
import SelectFilesStep from './ApiAndDownloadModalSteps/SelectFilesStep';
import { useDataApiTiles } from './ApiAndDownloadModalSteps/useDataApiTiles';
import {
    estimateSelectedTilesSize,
    formatFileSize,
    getDataApiTileGfwUrls,
    getResourceFormatLabel,
    getResourceSize,
    getStoredDataApiTiles,
    isCopyLinkResource,
    isDataApiResource,
    isEmailDeliveredResource,
    needsEmailDelivery,
} from './download-utils';
import styles from './modalStepLayout.module.scss';
import type { DatasetDownloadButtonProps } from './types';
import { useScrollTopOnStepChange } from './useScrollTopOnStepChange';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';

type DownloadStep = 'caution' | 'files' | 'terms' | 'confirmation';

export default function DatasetDownloadButton({
    dataset,
    size,
    isOpen,
    onClose,
    onOpen,
}: DatasetDownloadButtonProps) {
    const hasCautions = Boolean(dataset.cautions?.trim());
    const stepOrder: DownloadStep[] = hasCautions
        ? ['caution', 'files', 'terms', 'confirmation']
        : ['files', 'terms', 'confirmation'];
    const firstStep = stepOrder[0]!;

    const [activeStep, setActiveStep] = useState<DownloadStep>(firstStep);
    const [isApiFlowOpen, setIsApiFlowOpen] = useState(false);
    const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
    const [selectedTilesByResourceId, setSelectedTilesByResourceId] = useState<
        Record<string, string[]>
    >({});
    const [deliveryEmail, setDeliveryEmail] = useState<string | undefined>(undefined);

    const closeModal = () => {
        setIsApiFlowOpen(false);
        onClose();
    };

    const selectTilesForResource = (resourceId: string, tiles: string[] | null) => {
        setSelectedTilesByResourceId((current) => {
            const next = { ...current };
            if (tiles === null) {
                delete next[resourceId];
            } else {
                next[resourceId] = tiles;
            }
            return next;
        });
    };
    const requestDownload = api.dataset.downloadZippedResources.useMutation();
    const createDownloadEvent = api.downloadEvents.createEvents.useMutation();

    // Data API resources are often saved without their tiles; resolve them on
    // demand so the tile picker works and the ZIP can be built.
    const {
        tilesByResourceId,
        tileInfoByResourceId,
        resolvedSizeByResourceId,
        loadingResourceIds,
    } = useDataApiTiles(dataset.resources, { enabled: isOpen && !isApiFlowOpen });

    useScrollTopOnStepChange(activeStep);

    const selectedResources = dataset.resources.filter((resource) =>
        selectedResourceIds.includes(resource.id)
    );
    const selectedCount = selectedResources.length;
    const totalSelectedBytes = selectedResources.reduce((sum, resource) => {
        // Data API resources have no CKAN size: their tiles are sized per tile.
        if (isDataApiResource(resource)) {
            const tiles =
                selectedTilesByResourceId[resource.id] ??
                tilesByResourceId[resource.id] ??
                getStoredDataApiTiles(resource);
            return (
                sum + estimateSelectedTilesSize(resource, tiles, tileInfoByResourceId[resource.id])
            );
        }

        // CKAN has no size for imported links: use the size read from the file.
        return sum + (getResourceSize(resource) ?? resolvedSizeByResourceId[resource.id] ?? 0);
    }, 0);
    const selectedFormats = Array.from(
        new Set(selectedResources.map((resource) => getResourceFormatLabel(resource)))
    );
    // Only Data API tile sets are packed into a server-side ZIP and emailed.
    // Everything else (DX S3 uploads, non-DX URLs, hosted-externally links) is
    // downloaded directly in the browser, so only those require delivery details.
    const hasServerDeliveredResources = needsEmailDelivery(selectedResources);

    const toggleResourceSelection = (resourceId: string) => {
        setSelectedResourceIds((currentSelection) => {
            if (currentSelection.includes(resourceId)) {
                return currentSelection.filter((id) => id !== resourceId);
            }

            return [...currentSelection, resourceId];
        });
    };

    const submitReviewDetails = async (formData: ReviewDetailsAndTermsFormData) => {
        setDeliveryEmail(formData.email.trim() || undefined);

        // Only Data API tile sets are delivered by email through the server-side
        // ZIP flow. Any other selection is downloaded in the browser on the next
        // step, so no request is made and no email is sent.
        if (!hasServerDeliveredResources) {
            if (!formData.email.trim()) {
                setActiveStep('confirmation');
                return;
            }

            // The user opted in to updates / research contact: record it, then
            // continue to the in-browser download.
            try {
                await createDownloadEvent.mutateAsync({
                    email: formData.email,
                    affiliation: {
                        label: formData.affiliation?.label ?? '',
                        value: formData.affiliation?.value ?? '',
                    },
                    otherAffiliation: formData.otherAffiliation,
                    organization: formData.organization,
                    jobTitle: formData.jobTitle,
                    country: {
                        label: formData.country?.label ?? '',
                        value: formData.country?.value ?? '',
                    },
                    resources: selectedResources
                        .filter((resource) => !isCopyLinkResource(resource))
                        .map((resource) => resource.id)
                        .filter(Boolean),
                    package_id: dataset.id,
                    package_name: dataset.name,
                    acceptTerms: formData.subscribeUpdates || formData.contactForResearch,
                    typeOfForm: 'email-download',
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                });
            } catch {
                // The opt-in is secondary: never block the browser download on it.
            }

            setActiveStep('confirmation');
            return;
        }

        if (!formData.email.trim()) {
            setActiveStep('confirmation');
            return;
        }

        const resourceIds = selectedResources
            .filter(isEmailDeliveredResource)
            .map((resource) => resource.id)
            .filter(Boolean);
        const keys = selectedResources.flatMap((resource) => {
            // Only Data API tile sets go to the server ZIP; copy-only resources
            // (GEE assets / tile caches) are never downloaded, and S3 / external
            // files are downloaded in the browser.
            if (!isEmailDeliveredResource(resource)) {
                return [];
            }

            const tiles = tilesByResourceId[resource.id];
            return getDataApiTileGfwUrls(
                tiles ? { ...resource, data_api_tiles: tiles } : resource,
                selectedTilesByResourceId[resource.id]
            );
        });

        // Every selected resource reaching this point is a Data API tile set, so a
        // missing key means the tiles could not be resolved — nothing to email.
        if (resourceIds.length === 0 && keys.length === 0) {
            toast('Please select at least one file to download.', { type: 'error' });
            return;
        }

        try {
            await requestDownload.mutateAsync({
                email: formData.email,
                dataset_id: dataset.id,
                resource_ids: resourceIds,
                keys,
            });

            await createDownloadEvent.mutateAsync({
                email: formData.email,
                affiliation: {
                    label: formData.affiliation?.label ?? '',
                    value: formData.affiliation?.value ?? '',
                },
                otherAffiliation: formData.otherAffiliation,
                organization: formData.organization,
                jobTitle: formData.jobTitle,
                country: {
                    label: formData.country?.label ?? '',
                    value: formData.country?.value ?? '',
                },
                resources: resourceIds,
                package_id: dataset.id,
                package_name: dataset.name,
                acceptTerms: formData.subscribeUpdates || formData.contactForResearch,
                typeOfForm: 'email-download',
                firstName: formData.firstName,
                lastName: formData.lastName,
            });

            toast("You'll receive an email when the file is ready", {
                type: 'success',
            });
            setActiveStep('confirmation');
        } catch {
            toast('Failed to request file', { type: 'error' });
        }
    };

    const activeStepIndex = stepOrder.indexOf(activeStep);
    const items = stepOrder.map((step, index) => {
        const label =
            step === 'caution'
                ? 'Review caution'
                : step === 'files'
                  ? 'Select files'
                  : step === 'terms'
                    ? 'Review details & terms'
                    : 'Confirmation';

        return {
            id: `step-${index + 1}`,
            label: (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: getThemedSpacing(200),
                        fontWeight: activeStep === step ? 700 : undefined,
                    }}
                >
                    {label}
                    {index < activeStepIndex && <CheckIcon height={16} width={16} />}
                </div>
            ),
            icon: <NumberIcon value={String(index + 1)} />,
            isHighlighted: activeStep === step,
        };
    });

    const currentStep = (() => {
        switch (activeStep) {
            case 'caution':
                return (
                    <ReviewCautionStep
                        dataset={dataset}
                        onBack={closeModal}
                        onContinue={() => setActiveStep('files')}
                    />
                );
            case 'files':
                return (
                    <SelectFilesStep
                        dataset={dataset}
                        selectedResourceIds={selectedResourceIds}
                        selectedTilesByResourceId={selectedTilesByResourceId}
                        tilesByResourceId={tilesByResourceId}
                        tileInfoByResourceId={tileInfoByResourceId}
                        resolvedSizeByResourceId={resolvedSizeByResourceId}
                        resolvingResourceIds={loadingResourceIds}
                        onToggleResource={toggleResourceSelection}
                        onSelectTiles={selectTilesForResource}
                        onBack={() => {
                            if (hasCautions) {
                                setActiveStep('caution');
                                return;
                            }
                            closeModal();
                        }}
                        onContinue={() => setActiveStep('terms')}
                    />
                );
            case 'terms':
                return (
                    <ReviewDetailsAndTermsStep
                        dataset={dataset}
                        downloadMultipleFiles={hasServerDeliveredResources}
                        onBack={() => setActiveStep('files')}
                        onContinue={submitReviewDetails}
                        isSubmitting={requestDownload.isLoading || createDownloadEvent.isLoading}
                    />
                );
            case 'confirmation':
                return (
                    <ConfirmationStep
                        selectedResources={selectedResources.map((resource) =>
                            isDataApiResource(resource)
                                ? {
                                      ...resource,
                                      data_api_tiles:
                                          selectedTilesByResourceId[resource.id] ??
                                          tilesByResourceId[resource.id] ??
                                          resource.data_api_tiles,
                                  }
                                : resource
                        )}
                        totalSelectedBytes={totalSelectedBytes}
                        resolvedSizeByResourceId={resolvedSizeByResourceId}
                        deliveryEmail={deliveryEmail}
                        onBack={() => setActiveStep('terms')}
                        onClose={closeModal}
                        onOpenAccessApi={() => setIsApiFlowOpen(true)}
                    />
                );
        }
    })();

    return (
        <>
            <Button
                variant="primary"
                size={size}
                leftIcon={<ArrowDownTrayIcon />}
                onClick={() => {
                    setIsApiFlowOpen(false);
                    setActiveStep(firstStep);
                    setSelectedResourceIds([]);
                    setSelectedTilesByResourceId({});
                    setDeliveryEmail(undefined);
                    onOpen();
                }}
            >
                Download
            </Button>

            <Modal
                open={isOpen}
                onClose={closeModal}
                size="xlarge"
                header={isApiFlowOpen ? 'Access data via API' : 'Download data'}
                content={
                    isApiFlowOpen ? (
                        <AccessApiModalContent dataset={dataset} onClose={closeModal} />
                    ) : (
                        <div
                            className={styles.modalStepLayout}
                            style={{
                                padding: getThemedSpacing(600),
                                gap: getThemedSpacing(1000),
                            }}
                        >
                            <div className={styles.modalStepSidebar}>
                                <div>
                                    <List items={items} />
                                    <div style={{ marginTop: getThemedSpacing(400) }}>
                                        <Panel
                                            width="full"
                                            content={
                                                <div
                                                    style={{
                                                        padding: `${getThemedSpacing(300)} ${getThemedSpacing(300)} ${getThemedSpacing(200)}`,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: getThemedSpacing(50),
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: getThemedFontSize(300),
                                                            fontWeight: 700,
                                                            color: getThemedColor('neutral', 900),
                                                        }}
                                                    >
                                                        Download summary
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: getThemedFontSize(500),
                                                            color:
                                                                selectedCount === 0
                                                                    ? getThemedColor('neutral', 700)
                                                                    : getThemedColor(
                                                                          'secondary',
                                                                          900
                                                                      ),
                                                        }}
                                                    >
                                                        {selectedCount === 0 ? (
                                                            <>
                                                                <div>No files added yet.</div>
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            getThemedFontSize(300),
                                                                    }}
                                                                >
                                                                    Files you add will show here.
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span
                                                                    style={{
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {selectedCount}
                                                                </span>
                                                                {' files added'}
                                                            </>
                                                        )}
                                                    </div>
                                                    {selectedFormats.length > 0 && (
                                                        <>
                                                            {totalSelectedBytes > 0 && (
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            getThemedFontSize(300),
                                                                        color: getThemedColor(
                                                                            'neutral',
                                                                            700
                                                                        ),
                                                                    }}
                                                                >
                                                                    Estimated size:{' '}
                                                                    {formatFileSize(
                                                                        totalSelectedBytes
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        getThemedFontSize(300),
                                                                    color: getThemedColor(
                                                                        'neutral',
                                                                        700
                                                                    ),
                                                                }}
                                                            >
                                                                Formats:{' '}
                                                                {selectedFormats.join(', ')}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div
                                id="main-content"
                                className={styles.modalStepMain}
                                style={{ paddingBottom: getThemedSpacing(1000) }}
                            >
                                {currentStep}
                            </div>
                        </div>
                    )
                }
            />
        </>
    );
}
