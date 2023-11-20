import classNames from '@/utils/classnames'
import { useLayoutEffect, useRef, useState } from 'react'

export function TextWithReadMore({
    readMoreTrigger,
    children,
    className = 'max-h-[180px]',
}: {
    readMoreTrigger: (readMore: boolean) => React.ReactNode
    children: React.ReactNode
    className?: string
}) {
    const [showReadMore, setShowReadMore] = useState(false)
    const [readMore, setReadMore] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
    useLayoutEffect(() => {
        if (
            ref.current &&
            ref.current.clientHeight < ref.current.scrollHeight
        ) {
            setShowReadMore(true)
            return
        }
        setShowReadMore(false)
    }, [])

    return (
        <div>
            <div
                ref={ref}
                className={classNames(
                    'overflow-y-hidden',
                    className,
                    readMore ? 'max-h-fit' : ''
                )}
            >
                {children}
            </div>
            {showReadMore && (
                <span onClick={() => setReadMore(!readMore)}>
                    {readMoreTrigger(readMore)}
                </span>
            )}
        </div>
    )
}
