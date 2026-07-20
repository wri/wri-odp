import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
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
import SelectFilesStep from './DownloadModalSteps/SelectFilesStep';
import type { DatasetDownloadButtonProps } from './types';

export default function DatasetDownloadButton({ size }: DatasetDownloadButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDesktopLayout, setIsDesktopLayout] = useState(false);

    useEffect(() => {
        const checkViewport = () => {
            setIsDesktopLayout(window.innerWidth >= 1024);
        };

        checkViewport();
        window.addEventListener('resize', checkViewport);

        return () => {
            window.removeEventListener('resize', checkViewport);
        };
    }, []);

    const items = [
        {
            id: 'step-1',
            label: 'Review caution',
            icon: <NumberIcon value="1" />,
            isHighlighted: false,
        },
        {
            id: 'step-2',
            label: 'Select files',
            icon: <NumberIcon value="2" />,
            isHighlighted: true,
        },
        {
            id: 'step-3',
            label: 'Review details & terms',
            icon: <NumberIcon value="3" />,
            isHighlighted: false,
        },
        {
            id: 'step-4',
            label: 'Confirmation',
            icon: <NumberIcon value="4" />,
            isHighlighted: false,
        },
    ];
    return (
        <>
            <Button
                variant="primary"
                size={size}
                leftIcon={<ArrowDownTrayIcon />}
                onClick={() => setIsModalOpen(true)}
            >
                Download
            </Button>

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="xlarge"
                header="Download data"
                content={
                    <div
                        style={{
                            padding: getThemedSpacing(600),
                            gap: getThemedSpacing(1000),
                            display: 'flex',
                            flexDirection: isDesktopLayout ? 'row' : 'column',
                        }}
                    >
                        <div style={{ width: isDesktopLayout ? '240px' : '100%' }}>
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
                        <div id="main-content">
                            <SelectFilesStep />
                        </div>
                    </div>
                }
            />
        </>
    );
}
