import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { PlusIcon } from '@heroicons/react/24/outline';
import FileCard from './FileCard';

function SelectFilesStep() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(500),
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(200),
                }}
            >
                <h1
                    style={{
                        fontSize: getThemedFontSize(700),
                        fontWeight: 700,
                        color: getThemedColor('neutral', 900),
                    }}
                >
                    Select files
                </h1>
                <p
                    style={{
                        fontSize: getThemedFontSize(400),
                        fontWeight: 400,
                        color: getThemedColor('neutral', 800),
                    }}
                >
                    Choose one or more data resources to download.
                </p>
            </div>

            {/* Cards */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(400),
                }}
            >
                <FileCard
                    title="Dataset instructions"
                    badge="ZIP"
                    description="Documentation to help you understand and use this dataset, including methodology, file structure and supporting guidance."
                    createdAt="Oct 10, 2024"
                    updatedAt="Oct 10, 2024"
                    rightContent={
                        <Button
                            variant="secondary"
                            size="default"
                            leftIcon={<PlusIcon />}
                            onClick={() => console.log('add')}
                        >
                            Add
                        </Button>
                    }
                />
                <FileCard
                    title="Tropical Tree Cover GeoTIFF tiles"
                    badge="GeoTIFF tile set"
                    description="High-resolution raster tiles covering tropical tree cover across the global tropics."
                    createdAt="Oct 10, 2024"
                    updatedAt="Oct 10, 2024"
                    rightContent={
                        <Button
                            variant="secondary"
                            size="default"
                            leftIcon={<PlusIcon />}
                            onClick={() => console.log('add and configure')}
                        >
                            Add and configure
                        </Button>
                    }
                />
            </div>

            {/* Button group */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" size="default" onClick={() => console.log('back')}>
                    Back
                </Button>
                <Button variant="primary" size="default" disabled>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default SelectFilesStep;
