import { DocumentDuplicateIcon } from '@heroicons/react/20/solid';
import { useDataset } from '@/utils/storeHooks';
import {
    getThemedSpacing,
    Button,
    Modal,
    Textarea,
    Tooltip,
} from '@worldresources/wri-design-systems';
import { useRouter } from 'next/router';

export default function ExportModal({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}) {
    const router = useRouter();
    const { dataset } = useDataset();

    const searchParams = new URLSearchParams(window.location.search);
    const map = searchParams.get('map');

    const queryDatasetName = router.query.datasetName;
    const datasetName =
        dataset?.name ||
        (typeof queryDatasetName === 'string' ? queryDatasetName : undefined) ||
        '';

    const embedUrl = `${window.location.origin}/datasets/${datasetName}/embed/map?map=${map}`;

    const iFrameHtml = `<iframe src="${embedUrl}" width="1000" height="800"></iframe>`;

    return (
        <Modal
            open={isOpen}
            onClose={() => setIsOpen(false)}
            size="large"
            header="Export as"
            content={
                <div style={{ padding: getThemedSpacing(800) }}>
                    <p>Embed this view</p>
                    <div className="relative">
                        <Textarea disabled value={iFrameHtml} />
                        <div className="absolute right-3 bottom-3">
                            <Tooltip content="Copy to clipboard">
                                <Button
                                    variant="primary"
                                    size="small"
                                    onClick={() => {
                                        void navigator.clipboard.writeText(iFrameHtml);
                                    }}
                                    leftIcon={<DocumentDuplicateIcon className="w-4" />}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
