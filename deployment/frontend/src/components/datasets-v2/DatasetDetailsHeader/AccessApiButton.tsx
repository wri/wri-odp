import { useState } from 'react';
import { CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Button, getThemedSpacing, List, Modal } from '@worldresources/wri-design-systems';
import { NumberIcon } from './NumberIcon';
import ReviewCautionStep from './ApiAndDownloadModalSteps/ReviewCautionStep';
import ReviewDetailsAndTermsStep from './ApiAndDownloadModalSteps/ReviewDetailsAndTermsStep';
import SelectEndpoints from './ApiAndDownloadModalSteps/SelectEndpoints';
import styles from './modalStepLayout.module.scss';
import { buildStepSidebarState, useConditionalStepFlow } from './step-flow.utils';
import type { AccessApiButtonProps } from './types';
import { useScrollTopOnStepChange } from './useScrollTopOnStepChange';

type ApiStep = 'caution' | 'terms' | 'endpoints';

const API_STEPS_WITH_CAUTION = ['caution', 'terms', 'endpoints'] as const;
const API_STEPS_WITHOUT_CAUTION = ['terms', 'endpoints'] as const;
const API_STEP_LABELS: Record<ApiStep, string> = {
    caution: 'Review caution',
    terms: 'Review details & terms',
    endpoints: 'Select endpoints',
};

export default function AccessApiButton({
    dataset,
    hideButton,
    isAccessApiModalOpen = false,
}: AccessApiButtonProps) {
    const hasCautions = Boolean(dataset.cautions?.trim());
    const { activeStep, firstStep, resetActiveStep, setActiveStep, stepOrder } =
        useConditionalStepFlow<ApiStep>({
            condition: hasCautions,
            whenTrue: API_STEPS_WITH_CAUTION,
            whenFalse: API_STEPS_WITHOUT_CAUTION,
        });

    const [isModalOpen, setIsModalOpen] = useState(false);
    useScrollTopOnStepChange(activeStep);

    const closeModal = () => {
        setIsModalOpen(false);
        resetActiveStep();
    };

    const items = buildStepSidebarState(stepOrder, activeStep, API_STEP_LABELS).map((item) => ({
        id: item.id,
        label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: getThemedSpacing(200) }}>
                {item.label}
                {item.isCompleted && <CheckIcon height={16} width={16} />}
            </div>
        ),
        icon: <NumberIcon value={item.stepNumber} />,
        isHighlighted: item.isHighlighted,
    }));

    const currentStep = (() => {
        switch (activeStep) {
            case 'caution':
                return (
                    <ReviewCautionStep
                        dataset={dataset}
                        onBack={closeModal}
                        onContinue={() => setActiveStep('terms')}
                    />
                );
            case 'terms':
                return (
                    <ReviewDetailsAndTermsStep
                        onBack={() => {
                            if (hasCautions) {
                                setActiveStep('caution');
                                return;
                            }
                            closeModal();
                        }}
                        onContinue={() => setActiveStep('endpoints')}
                    />
                );
            case 'endpoints':
                return (
                    <SelectEndpoints onBack={() => setActiveStep('terms')} onClose={closeModal} />
                );
        }
    })();

    return (
        <>
            {!hideButton && (
                <Button
                    variant="secondary"
                    size="default"
                    leftIcon={<GlobeAltIcon />}
                    onClick={() => {
                        setActiveStep(firstStep);
                        setIsModalOpen(true);
                    }}
                >
                    Access API
                </Button>
            )}

            <Modal
                open={isModalOpen || isAccessApiModalOpen}
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
