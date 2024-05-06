import { DefaultTooltip } from '../../Tooltip'

interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    tooltip: string
}

export default function IconButton({
    children,
    tooltip,
    ...props
}: IconButtonProps) {
    return (
        <DefaultTooltip side="left" content={tooltip}>
            <button
                aria-label={tooltip}
                {...props}
                className={`${
                    props?.className ?? ''
                } bg-white hover:bg-gray-100 transition w-12 h-12 flex items-center justify-center shadow`}
            >
                {children}
            </button>
        </DefaultTooltip>
    )
}
