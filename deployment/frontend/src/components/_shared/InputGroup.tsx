import classNames from '@/utils/classnames'
import { ErrorMessage } from '@hookform/error-message'
import { FieldErrors } from 'react-hook-form'
import { DefaultTooltip } from './Tooltip'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export function InputGroup({
    label,
    className,
    labelClassName,
    children,
    required = false,
    info,
}: {
    label: string | React.ReactNode
    className?: string
    labelClassName?: string
    children: React.ReactNode
    required?: boolean
    info?: string
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
                        'col-span-2 text-left sm:text-end font-acumin xxl:text-lg font-normal leading-tight text-black sm:max-w-[5rem] flex items-center',
                        labelClassName ?? ''
                    )}
                >
                    {label}{' '}
                    {required && <span className="text-red-500">*</span>}
                    {info && (
                        <DefaultTooltip content={info} contentClassName=''>
                            <InformationCircleIcon
                                className="h-5 w-5 text-neutral-500 ml-1 mb-1"
                                aria-hidden="true"
                            />
                        </DefaultTooltip>
                    )}
                </span>
            ) : (
                <>{label}</>
            )}
            <div className="col-span-6 h-full grow w-full">{children}</div>
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
                <p className="col-span-full text-justify text-sm text-red-600">
                    {message}
                </p>
            )}
        />
    )
}
