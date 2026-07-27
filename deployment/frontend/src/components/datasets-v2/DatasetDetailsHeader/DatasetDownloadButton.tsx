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
import ConfirmationStep from './ApiAndDownloadModalSteps/ConfirmationStep';
import ReviewCautionStep from './ApiAndDownloadModalSteps/ReviewCautionStep';
import ReviewDetailsAndTermsStep from './ApiAndDownloadModalSteps/ReviewDetailsAndTermsStep';
import SelectFilesStep from './ApiAndDownloadModalSteps/SelectFilesStep';
import { formatFileSize, getResourceFormatLabel } from './download-utils';
import styles from './modalStepLayout.module.scss';
import { buildStepSidebarState, useConditionalStepFlow } from './step-flow.utils';
import type { DatasetDownloadButtonProps } from './types';
import { useScrollTopOnStepChange } from './useScrollTopOnStepChange';

type DownloadStep = 'caution' | 'files' | 'terms' | 'confirmation';

const DOWNLOAD_STEPS_WITH_CAUTION = ['caution', 'files', 'terms', 'confirmation'] as const;
const DOWNLOAD_STEPS_WITHOUT_CAUTION = ['files', 'terms', 'confirmation'] as const;
const DOWNLOAD_STEP_LABELS: Record<DownloadStep, string> = {
    caution: 'Review caution',
    files: 'Select files',
    terms: 'Review details & terms',
    confirmation: 'Confirmation',
};

export default function DatasetDownloadButton({ dataset, size }: DatasetDownloadButtonProps) {
    const hasCautions = Boolean(dataset.cautions?.trim());
    const { activeStep, firstStep, resetActiveStep, setActiveStep, stepOrder } =
        useConditionalStepFlow<DownloadStep>({
            condition: hasCautions,
            whenTrue: DOWNLOAD_STEPS_WITH_CAUTION,
            whenFalse: DOWNLOAD_STEPS_WITHOUT_CAUTION,
        });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

    useScrollTopOnStepChange(activeStep);

    const selectedResources = dataset.resources.filter((resource) =>
        selectedResourceIds.includes(resource.id)
    );
    const selectedCount = selectedResources.length;
    const totalSelectedBytes = selectedResources.reduce(
        (sum, resource) => sum + Number(resource.size ?? 0),
        0
    );
    const selectedFormats = Array.from(
        new Set(selectedResources.map((resource) => getResourceFormatLabel(resource)))
    );

    const closeModal = () => {
        setIsModalOpen(false);
        resetActiveStep();
        setSelectedResourceIds([]);
    };

    const toggleResourceSelection = (resourceId: string) => {
        setSelectedResourceIds((currentSelection) => {
            if (currentSelection.includes(resourceId)) {
                return currentSelection.filter((id) => id !== resourceId);
            }

            return [...currentSelection, resourceId];
        });
    };

    const items = buildStepSidebarState(stepOrder, activeStep, DOWNLOAD_STEP_LABELS).map(
        (item) => ({
            id: item.id,
            label: (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: getThemedSpacing(200),
                    }}
                >
                    {item.label}
                    {item.isCompleted && <CheckIcon height={16} width={16} />}
                </div>
            ),
            icon: <NumberIcon value={item.stepNumber} />,
            isHighlighted: item.isHighlighted,
        })
    );

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
                        onToggleResource={toggleResourceSelection}
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
                        onBack={() => setActiveStep('files')}
                        onContinue={() => setActiveStep('confirmation')}
                    />
                );
            case 'confirmation':
                return (
                    <ConfirmationStep onBack={() => setActiveStep('terms')} onClose={closeModal} />
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
                    setActiveStep(firstStep);
                    setSelectedResourceIds([]);
                    setIsModalOpen(true);
                }}
            >
                Download
            </Button>

            <Modal
                open={isModalOpen}
                onClose={closeModal}
                size="xlarge"
                header="Download data"
                content={
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
                                                                : getThemedColor('secondary', 900),
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
                                                        <div
                                                            style={{
                                                                fontSize: getThemedFontSize(300),
                                                                color: getThemedColor(
                                                                    'neutral',
                                                                    700
                                                                ),
                                                            }}
                                                        >
                                                            Estimated size:{' '}
                                                            {formatFileSize(totalSelectedBytes)}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: getThemedFontSize(300),
                                                                color: getThemedColor(
                                                                    'neutral',
                                                                    700
                                                                ),
                                                            }}
                                                        >
                                                            Formats: {selectedFormats.join(', ')}
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
                }
            />
        </>
    );
}
