import { useMemo, useState } from 'react';

type ConditionalStepFlowOptions<TStep extends string> = {
    condition: boolean;
    whenTrue: readonly [TStep, ...TStep[]];
    whenFalse: readonly [TStep, ...TStep[]];
};

export function useConditionalStepFlow<TStep extends string>({
    condition,
    whenTrue,
    whenFalse,
}: ConditionalStepFlowOptions<TStep>) {
    const stepOrder = useMemo(
        () => (condition ? [...whenTrue] : [...whenFalse]),
        [condition, whenTrue, whenFalse],
    );

    const firstStep = stepOrder[0]!;
    const [activeStep, setActiveStep] = useState<TStep>(firstStep);
    const activeStepIndex = stepOrder.indexOf(activeStep);

    const resetActiveStep = () => setActiveStep(firstStep);

    return {
        activeStep,
        activeStepIndex,
        firstStep,
        resetActiveStep,
        setActiveStep,
        stepOrder,
    };
}

export function buildStepSidebarState<TStep extends string>(
    stepOrder: readonly TStep[],
    activeStep: TStep,
    labelByStep: Record<TStep, string>,
) {
    const activeStepIndex = stepOrder.indexOf(activeStep);

    return stepOrder.map((step, index) => ({
        id: `step-${index + 1}`,
        label: labelByStep[step],
        isCompleted: index < activeStepIndex,
        isHighlighted: activeStep === step,
        stepNumber: String(index + 1),
    }));
}
