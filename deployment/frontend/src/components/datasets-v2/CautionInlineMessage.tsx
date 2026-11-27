'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, InlineMessage } from '@worldresources/wri-design-systems';

type Props = {
    text: string;
    icon?: ReactNode;
};

function CautionInlineMessage({ text, icon }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [overflows, setOverflows] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const element = textRef.current;

        if (!element) {
            return;
        }

        const measure = () => {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight) || 0;
            setOverflows(lineHeight > 0 && element.scrollHeight > lineHeight * 3);
        };

        measure();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }

        const observer = new ResizeObserver(measure);
        observer.observe(element);
        window.addEventListener('resize', measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [text]);

    return (
        <InlineMessage
            icon={icon}
            size="full-width"
            variant="warning"
            label="Caution for using this dataset"
            caption={
                <p
                    ref={textRef}
                    style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: isExpanded ? 'unset' : 3,
                        overflow: 'hidden',
                    }}
                >
                    {text}
                </p>
            }
        >
            {overflows ? (
                <Button variant="primary" onClick={() => setIsExpanded((expanded) => !expanded)}>
                    {isExpanded ? 'Read less' : 'Read more'}
                </Button>
            ) : undefined}
        </InlineMessage>
    );
}

export default CautionInlineMessage;
