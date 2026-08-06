import { getThemedSpacing, Modal, Radio, RadioGroup } from '@worldresources/wri-design-systems';
import { type Basemap, type Labels } from '@/interfaces/state.interface';
import { useBasemap, useLabels } from '@/utils/storeHooks';

export default function SettingsModal({
    openSettingsModal,
    setOpenSettingsModal,
}: {
    openSettingsModal: boolean;
    setOpenSettingsModal: (open: boolean) => void;
}) {
    const basemaps = ['light', 'dark', 'satellite', 'terrain', 'aqueduct'];
    const { selectedBasemap, setBasemap } = useBasemap();

    const labels = ['light', 'dark', 'none'];
    const { selectedLabels, setLabels } = useLabels();

    return (
        <Modal
            open={openSettingsModal}
            onClose={() => setOpenSettingsModal(false)}
            size="medium"
            header="Map settings"
            content={
                <div
                    className="flex flex-row flex-wrap gap-y-5"
                    style={{ padding: getThemedSpacing(800) }}
                >
                    <div className="basis-1/2 pr-2">
                        <RadioGroup
                            name="basemap"
                            value={selectedBasemap}
                            onChange={(_name, value) => setBasemap(value as Basemap)}
                        >
                            {basemaps.map((basemap) => (
                                <Radio key={basemap} value={basemap}>
                                    {basemap}
                                </Radio>
                            ))}
                        </RadioGroup>
                    </div>
                    <div className="basis-1/2 pr-2">
                        <RadioGroup
                            name="labels"
                            value={selectedLabels}
                            onChange={(_name, value) => setLabels(value as Labels)}
                        >
                            {labels.map((label) => (
                                <Radio key={label} value={label}>
                                    {label}
                                </Radio>
                            ))}
                        </RadioGroup>
                    </div>
                </div>
            }
        />
    );
}
