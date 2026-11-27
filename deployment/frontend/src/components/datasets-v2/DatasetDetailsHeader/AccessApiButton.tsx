import { useState } from 'react';
import { CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Button, getThemedSpacing, List, Modal } from '@worldresources/wri-design-systems';
import { NumberIcon } from './NumberIcon';
import ReviewCautionStep from './ApiAndDownloadModalSteps/ReviewCautionStep';
import ReviewDetailsAndTermsStep from './ApiAndDownloadModalSteps/ReviewDetailsAndTermsStep';
import SelectEndpoints from './ApiAndDownloadModalSteps/SelectEndpoints';
import styles from './modalStepLayout.module.scss';
import type { AccessApiButtonProps } from './types';
import { useScrollTopOnStepChange } from './useScrollTopOnStepChange';

type ApiStep = 'caution' | 'terms' | 'endpoints';

type AccessApiModalContentProps = Pick<AccessApiButtonProps, 'dataset' | 'onClose'>;

export function AccessApiModalContent({ dataset, onClose }: AccessApiModalContentProps) {
    const hasCautions = Boolean(dataset.cautions?.trim());
    const stepOrder: ApiStep[] = hasCautions
        ? ['caution', 'terms', 'endpoints']
        : ['terms', 'endpoints'];
    const firstStep = stepOrder[0]!;

    const [activeStep, setActiveStep] = useState<ApiStep>(firstStep);
    useScrollTopOnStepChange(activeStep);

    const activeStepIndex = stepOrder.indexOf(activeStep);
    const items = stepOrder.map((step, index) => {
        const label =
            step === 'caution'
                ? 'Review caution'
                : step === 'terms'
                  ? 'Review details & terms'
                  : 'Select endpoints';

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
                        onBack={onClose}
                        onContinue={() => setActiveStep('terms')}
                    />
                );
            case 'terms':
                return (
                    <ReviewDetailsAndTermsStep
                        dataset={dataset}
                        onBack={() => {
                            if (hasCautions) {
                                setActiveStep('caution');
                                return;
                            }
                            onClose();
                        }}
                        onContinue={() => setActiveStep('endpoints')}
                    />
                );
            case 'endpoints':
                return (
                    <SelectEndpoints
                        dataset={dataset}
                        onBack={() => setActiveStep('terms')}
                        onClose={onClose}
                    />
                );
        }
    })();

    return (
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
    );
}

export default function AccessApiButton({
    dataset,
    hideButton,
    isOpen,
    onClose,
    onOpen,
}: AccessApiButtonProps) {
    return (
        <>
            {!hideButton && (
                <Button
                    variant="secondary"
                    size="default"
                    leftIcon={<GlobeAltIcon />}
                    onClick={onOpen}
                >
                    Access API
                </Button>
            )}

            <Modal
                open={isOpen}
                onClose={onClose}
                size="xlarge"
                header="Access data via API"
                content={<AccessApiModalContent dataset={dataset} onClose={onClose} />}
            />
        </>
    );
}
