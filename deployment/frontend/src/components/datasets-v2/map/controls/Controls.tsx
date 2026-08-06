import { useState, type MutableRefObject } from 'react';
import type { MapRef } from 'react-map-gl';
import { getThemedSpacing, Toolbar } from '@worldresources/wri-design-systems';
import Search from './Search';
import { PlusIcon, MinusIcon, Cog6ToothIcon, ShareIcon } from '@heroicons/react/24/solid';
import ExportModal from './ExportModal';
import SettingsModal from './SettingsModal';

export default function Controls({
    mapRef,
    mapContainerRef,
}: {
    mapRef: MutableRefObject<MapRef | null>;
    mapContainerRef: MutableRefObject<HTMLDivElement | null>;
}) {
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [openExportModal, setOpenExportModal] = useState(false);

    const mapControlItems = [
        {
            icon: <PlusIcon />,
            label: 'l.zoomInLabel',
            ariaLabel: 'l.zoomInAriaLabel',
            onClick: () => mapRef?.current?.zoomIn({ duration: 500 }),
        },
        {
            icon: <MinusIcon />,
            label: 'l.zoomOutLabel',
            ariaLabel: 'l.zoomOutAriaLabel',
            onClick: () => mapRef?.current?.zoomOut({ duration: 500 }),
        },
        {
            icon: <ShareIcon />,
            label: 'l.exportLabel',
            ariaLabel: 'l.exportAriaLabel',
            onClick: () => setOpenExportModal(true),
        },
        {
            icon: <Cog6ToothIcon />,
            label: 'l.mapSettingsLabel',
            ariaLabel: 'l.mapSettingsAriaLabel',
            onClick: () => setOpenSettingsModal(true),
        },
    ];

    return (
        <>
            <ExportModal isOpen={openExportModal} setIsOpen={setOpenExportModal} />
            <SettingsModal
                openSettingsModal={openSettingsModal}
                setOpenSettingsModal={setOpenSettingsModal}
            />
            <div
                style={{
                    display: 'flex',
                    padding: getThemedSpacing(400),
                    gap: getThemedSpacing(400),
                    width: '50%',
                    float: 'right',
                }}
            >
                <Search mapContainerRef={mapContainerRef} />
                <Toolbar items={mapControlItems} vertical showExpandedToggle={false} />
            </div>
        </>
    );
}
