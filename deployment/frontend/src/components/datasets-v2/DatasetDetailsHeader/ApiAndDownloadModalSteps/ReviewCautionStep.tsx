import type { WriDataset } from '@/schema/ckan.schema';
import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    InlineMessage,
} from '@worldresources/wri-design-systems';

type ReviewCautionProps = {
    onBack: () => void;
    onContinue: () => void;
    dataset: WriDataset;
};

function stripHtml(html: string) {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|pre|ul|ol|h[1-6])>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function ReviewCaution({ dataset, onBack, onContinue }: ReviewCautionProps) {
    const cautionText = stripHtml(dataset.cautions ?? '');

    return (
        <div>
            <h1
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                    color: getThemedColor('neutral', 900),
                }}
            >
                Review important information.
            </h1>
            <br />
            <div
                style={{
                    fontSize: getThemedFontSize(400),
                    fontWeight: 400,
                    color: getThemedColor('neutral', 800),
                }}
            >
                Before downloading this dataset, please review the following information.
            </div>
            <div style={{ margin: `${getThemedSpacing(500)} 0` }}>
                <InlineMessage
                    variant="warning"
                    label="Caution for using this dataset"
                    size="full-width"
                    caption={
                        <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                            {cautionText}
                        </div>
                    }
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    variant="secondary"
                    size="default"
                    onClick={onBack}
                    style={{ marginRight: getThemedSpacing(200) }}
                >
                    Back
                </Button>
                <Button variant="primary" size="default" onClick={onContinue}>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default ReviewCaution;
