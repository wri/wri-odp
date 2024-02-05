export const HttpMethodChip = ({
    children,
    className,
}: {
    children: React.ReactNode
    className: string
}) => {
    return (
        <div className="w-16">
            <span
                className={`bg-green-600 font-semibold text-white py-1 px-2 ${className}`}
            >
                {children}
            </span>
        </div>
    )
}
