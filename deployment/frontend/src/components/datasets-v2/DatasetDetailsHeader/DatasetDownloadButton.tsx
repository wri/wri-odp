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
import type { DatasetDownloadButtonProps } from './types';
import { useScrollTopOnStepChange } from './useScrollTopOnStepChange';

type DownloadStep = 'caution' | 'files' | 'terms' | 'confirmation';

export default function DatasetDownloadButton({ dataset, size }: DatasetDownloadButtonProps) {
    const hasCautions = Boolean(dataset.cautions?.trim());
    const stepOrder: DownloadStep[] = hasCautions
        ? ['caution', 'files', 'terms', 'confirmation']
        : ['files', 'terms', 'confirmation'];
    const firstStep = stepOrder[0]!;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeStep, setActiveStep] = useState<DownloadStep>(firstStep);
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
        setActiveStep(firstStep);
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
