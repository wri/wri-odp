import { getThemedColor, getThemedFontSize } from '@worldresources/wri-design-systems';
import { ErrorMessage } from '@hookform/error-message';
import type { FieldErrors } from 'react-hook-form';

type ErrorDisplayProps = {
    name: string;
    errors: FieldErrors;
};

/**
 * Component to display form validation errors in datasets-v2 components.
 * Uses inline styles with WRI design system tokens.
 */
export function ErrorDisplay({ name, errors }: ErrorDisplayProps) {
    return (
        <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
                <span
                    style={{
                        fontSize: getThemedFontSize(300),
                        color: getThemedColor('error', 500),
                        display: 'block',
                        marginTop: '4px',
                    }}
                >
                    {message}
                </span>
            )}
        />
    );
}

/**
 * Alternative component for displaying errors from fieldErrors object
 * (used when validation is done manually rather than with react-hook-form)
 */
type FieldErrorDisplayProps = {
    error?: string;
};

export function FieldErrorDisplay({ error }: FieldErrorDisplayProps) {
    if (!error) return null;

    return (
        <span
            style={{
                fontSize: getThemedFontSize(300),
                color: getThemedColor('error', 500),
                display: 'block',
                marginTop: '4px',
            }}
        >
            {error}
        </span>
    );
}
