import { Button, getThemedFontSize, getThemedSpacing } from '@worldresources/wri-design-systems';
import { hasValue } from '../utils/text';

type Props = {
    methodologyHtml: string;
    useCasesHtml: string;
    functionHtml: string;
    technicalNotesUrl?: string;
    cmsContentClassName: string;
};

export default function MethodologySection({
    methodologyHtml,
    useCasesHtml,
    functionHtml,
    technicalNotesUrl,
    cmsContentClassName,
}: Props) {
    return (
        <section id="methodology">
            <h2
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                    paddingBottom: getThemedSpacing(300),
                }}
            >
                Methodology
            </h2>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(400),
                }}
            >
                {hasValue(methodologyHtml) && (
                    <div
                        className={cmsContentClassName}
                        style={{
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            lineHeight: 'inherit',
                        }}
                        dangerouslySetInnerHTML={{
                            __html: methodologyHtml,
                        }}
                    ></div>
                )}

                {hasValue(useCasesHtml) && (
                    <>
                        <h3 className="font-semibold">Use cases</h3>
                        <div
                            className={cmsContentClassName}
                            style={{
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                lineHeight: 'inherit',
                            }}
                            dangerouslySetInnerHTML={{
                                __html: useCasesHtml,
                            }}
                        ></div>
                    </>
                )}

                {hasValue(functionHtml) && (
                    <>
                        <h3 className="font-semibold">Function</h3>
                        <div
                            className={cmsContentClassName}
                            style={{
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                lineHeight: 'inherit',
                            }}
                            dangerouslySetInnerHTML={{
                                __html: functionHtml,
                            }}
                        ></div>
                    </>
                )}

                {hasValue(technicalNotesUrl) && (
                    <div>
                        <Button
                            size="small"
                            variant="secondary"
                            onClick={() => {
                                window.open(technicalNotesUrl, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            View technical note
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
