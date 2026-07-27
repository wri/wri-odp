import { useEffect } from 'react';

export function useScrollTopOnStepChange(step: string, elementId = 'main-content') {
    useEffect(() => {
        const mainContent = document.getElementById(elementId);
        mainContent?.scrollTo(0, 0);
    }, [elementId, step]);
}
