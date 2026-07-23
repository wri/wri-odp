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
import styles from './modalStepLayout.module.scss';
import type { DatasetDownloadButtonProps } from './types';

type DownloadStep = 1 | 2 | 3 | 4;
export default function DatasetDownloadButton({ dataset, size }: DatasetDownloadButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeStep, setActiveStep] = useState<DownloadStep>(2);

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveStep(2);
    };
    const items = [
        {
            id: 'step-1',
            label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: getThemedSpacing(200) }}>
                    Review caution <CheckIcon height={16} width={16} />
                </div>
            ),
            icon: <NumberIcon value="1" />,
            isHighlighted: activeStep === 1,
        },
        {
            id: 'step-2',
            label: 'Select files',
            icon: <NumberIcon value="2" />,
            isHighlighted: activeStep === 2,
        },
        {
            id: 'step-3',
            label: 'Review details & terms',
            icon: <NumberIcon value="3" />,
            isHighlighted: activeStep === 3,
        },
        {
            id: 'step-4',
            label: 'Confirmation',
            icon: <NumberIcon value="4" />,
            isHighlighted: activeStep === 4,
        },
    ];

    const currentStep = (() => {
        switch (activeStep) {
            case 1:
                return (
                    <ReviewCautionStep
                        onBack={() => closeModal()}
                        onContinue={() => setActiveStep(2)}
                    />
                );
            case 2:
                return (
                    <SelectFilesStep
                        dataset={dataset}
                        onBack={() => setActiveStep(1)}
                        onContinue={() => setActiveStep(3)}
                    />
                );
            case 3:
                return (
                    <ReviewDetailsAndTermsStep
                        onBack={() => setActiveStep(2)}
                        onContinue={() => setActiveStep(4)}
                    />
                );
            case 4:
                return <ConfirmationStep onBack={() => setActiveStep(3)} onClose={closeModal} />;
        }
    })();
    return (
        <>
            <Button
                variant="primary"
                size={size}
                leftIcon={<ArrowDownTrayIcon />}
                onClick={() => {
                    setActiveStep(2);
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
                                                        color: getThemedColor('secondary', 900),
                                                    }}
                                                >
                                                    <span style={{ fontWeight: 700 }}>17</span>
                                                    {' files added'}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: getThemedFontSize(300),
                                                        color: getThemedColor('neutral', 700),
                                                    }}
                                                >
                                                    Estimated size: 13.4 MB
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: getThemedFontSize(300),
                                                        color: getThemedColor('neutral', 700),
                                                    }}
                                                >
                                                    Formats: GeoTIFF, ZIP
                                                </div>
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
