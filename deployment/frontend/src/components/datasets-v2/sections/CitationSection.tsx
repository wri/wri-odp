import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

type Props = {
    citationHtml: string;
    citationText: string;
    cmsContentClassName: string;
};

export default function CitationSection({
    citationHtml,
    citationText,
    cmsContentClassName,
}: Props) {
    return (
        <section id="citation">
            <div
                style={{
                    display: 'flex',
                    gap: getThemedSpacing(400),
                    alignItems: 'center',
                }}
            >
                <h2
                    style={{
                        fontSize: getThemedFontSize(700),
                        fontWeight: 700,
                    }}
                >
                    Citation
                </h2>
                <Button
                    size="small"
                    variant="borderless"
                    rightIcon={<DocumentDuplicateIcon />}
                    onClick={() => {
                        void navigator.clipboard.writeText(citationText);
                    }}
                >
                    <span style={{ color: getThemedColor('neutral', 600) }}>Copy</span>
                </Button>
            </div>
            <div
                className={cmsContentClassName}
                dangerouslySetInnerHTML={{
                    __html: citationHtml,
                }}
            ></div>
        </section>
    );
}
