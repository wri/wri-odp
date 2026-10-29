import type { CSSProperties } from 'react';
import {
    Button,
    getThemedFontSize,
    getThemedLineHeight,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { hasValue } from '../utils/text';

type Props = {
    methodologyHtml: string;
    useCasesHtml: string;
    technicalNotesUrl?: string;
    cmsContentClassName: string;
};

export default function MethodologySection({
    methodologyHtml,
    useCasesHtml,
    technicalNotesUrl,
    cmsContentClassName,
}: Props) {
    return (
        <section
            id="methodology"
            className="[&_ul]:!my-0 [&_ul>li]:!my-0 [&_ul>li>p]:!my-0 [&_ul>li]:!leading-[var(--methodology-li-line-height)]"
            style={
                {
                    '--methodology-li-line-height': getThemedLineHeight(600),
                } as CSSProperties
            }
        >
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
                            lineHeight: getThemedLineHeight(600),
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
                                lineHeight: getThemedLineHeight(600),
                            }}
                            dangerouslySetInnerHTML={{
                                __html: useCasesHtml,
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
