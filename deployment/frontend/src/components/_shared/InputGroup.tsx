import classNames from '@/utils/classnames';
import { ErrorMessage } from '@hookform/error-message';
import { type FieldErrors } from 'react-hook-form';
import { DefaultTooltip } from './Tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { InformationCircleIcon as InformationSolidCircle } from '@heroicons/react/24/solid';

export function InputGroup({
    label,
    className,
    labelClassName,
    children,
    required = false,
    deepInfoIcon = false,
    contentClassName = '',
    info,
}: {
    label: string | React.ReactNode;
    className?: string;
    labelClassName?: string;
    children: React.ReactNode;
    required?: boolean;
    info?: string | React.ReactNode;
    deepInfoIcon?: boolean;
    contentClassName?: string;
}) {
    return (
        <div
            className={classNames(
                'grid sm:grid-cols-[12rem_1fr] items-start gap-x-8',
                className ?? ''
            )}
        >
            <span
                className={classNames(
                    'text-left font-acumin xxl:text-lg font-normal leading-tight text-black flex items-start gap-x-1',
                    labelClassName ?? ''
                )}
            >
                <span>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </span>
                {info && (
                    <DefaultTooltip content={info} contentClassName={contentClassName}>
                        {deepInfoIcon ? (
                            <InformationSolidCircle
                                className="h-5 w-5 text-neutral-500 shrink-0"
                                aria-hidden="true"
                            />
                        ) : (
                            <InformationCircleIcon
                                className="h-5 w-5 text-neutral-500 shrink-0"
                                aria-hidden="true"
                            />
                        )}
                    </DefaultTooltip>
                )}
            </span>
            <div className="h-full w-full min-w-0">{children}</div>
        </div>
    );
}

export function InputGroupCustom({
    label,
    className,
    labelClassName,
    children,
    required = false,
    info,
}: {
    label: string | React.ReactNode;
    className?: string;
    labelClassName?: string;
    children: React.ReactNode;
    required?: boolean;
    info?: React.ReactNode | string;
}) {
    return (
        <div
            className={classNames(
                'grid sm:grid-cols-[12rem_1fr] items-start gap-x-8',
                className ?? ''
            )}
        >
            <span
                className={classNames(
                    'text-left font-acumin xxl:text-lg font-normal leading-tight text-black flex items-start gap-x-1',
                    labelClassName ?? ''
                )}
            >
                <span>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </span>
                {info && (
                    <DefaultTooltip content={info} contentClassName=" bg-[#E5E5E5] text-[12px] ">
                        <InformationSolidCircle
                            className="h-5 w-5 text-neutral-500 shrink-0"
                            aria-hidden="true"
                        />
                    </DefaultTooltip>
                )}
            </span>
            <div className="h-full w-full min-w-0">{children}</div>
        </div>
    );
}

export function ErrorDisplay({ name, errors }: { name: string; errors: FieldErrors }) {
    return (
        <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
                <p className="col-span-full text-justify text-sm text-red-600">{message}</p>
            )}
        />
    );
}
