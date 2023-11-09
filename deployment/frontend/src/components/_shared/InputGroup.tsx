import classNames from '@/utils/classnames'
import { ErrorMessage } from '@hookform/error-message'
import { FieldErrors } from 'react-hook-form'

export function InputGroup({
    label,
    className,
    labelClassName,
    children,
    required = false,
}: {
    label: string | React.ReactNode
    className?: string
    labelClassName?: string
    children: React.ReactNode
    required?: boolean
}) {
    return (
        <div
            className={classNames(
                'grid sm:grid-cols-8 justify-between gap-x-14',
                className ?? ''
            )}
        >
            {typeof label === 'string' ? (
                <span
                    className={classNames(
                        'col-span-2 text-left sm:text-end font-acumin xxl:text-lg font-normal leading-tight text-black sm:max-w-[5rem]',
                        labelClassName ?? ''
                    )}
                >
                    {label}{' '}
                    {required && <span className="text-red-500">*</span>}
                </span>
            ) : (
                <>{label}</>
            )}
            <div className="col-span-6 h-full w-full">{children}</div>
        </div>
    )
}

export function ErrorDisplay({
    name,
    errors,
}: {
    name: string
    errors: FieldErrors
}) {
    return (
        <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
                <p className="col-span-full text-justify text-xs text-red-600">{message}</p>
            )}
        />
    )
}
