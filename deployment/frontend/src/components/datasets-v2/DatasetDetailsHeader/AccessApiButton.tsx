import { useState } from 'react';
import { CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Button, getThemedSpacing, List, Modal } from '@worldresources/wri-design-systems';
import { NumberIcon } from './NumberIcon';
import SelectEndpoints from './ApiAndDownloadModalSteps/SelectEndpoints';
import styles from './modalStepLayout.module.scss';
import type { AccessApiButtonProps } from './types';

export default function AccessApiButton({
    hideButton,
    isAccessApiModalOpen = false,
}: AccessApiButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const items = [
        {
            id: 'step-1',
            label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: getThemedSpacing(200) }}>
                    Review caution <CheckIcon height={16} width={16} />
                </div>
            ),
            icon: <NumberIcon value="1" />,
            isHighlighted: true,
        },
        {
            id: 'step-2',
            label: 'Review details & terms',
            icon: <NumberIcon value="2" />,
            isHighlighted: false,
        },
        {
            id: 'step-3',
            label: 'Select endpoints',
            icon: <NumberIcon value="3" />,
            isHighlighted: false,
        },
    ];
    return (
        <>
            {!hideButton && (
                <Button
                    variant="secondary"
                    size="default"
                    leftIcon={<GlobeAltIcon />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Access API
                </Button>
            )}

            <Modal
                open={isModalOpen || isAccessApiModalOpen}
                onClose={() => setIsModalOpen(false)}
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
                                <List items={items} highlightedIndex={0} />
                            </div>
                        </div>
                        <div id="main-content" className={styles.modalStepMain}>
                            <SelectEndpoints />
                        </div>
                    </div>
                }
            />
        </>
    );
}
