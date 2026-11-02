import { zodResolver } from '@hookform/resolvers/zod';
import {
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
    TextInput,
} from '@worldresources/wri-design-systems';
import { useForm, useWatch } from 'react-hook-form';
import { contactDetailsFormSchema, type ContactDetailsFormData } from './contactDetailsForm.utils';
import { FieldErrorDisplay } from '../../utils/ErrorDisplay';

export type ContactDetailsFieldErrors = Partial<Record<keyof ContactDetailsFormData, string>>;

type ContactDetailsFormProps = {
    formData: ContactDetailsFormData;
    fieldErrors?: ContactDetailsFieldErrors;
    onChange: (formData: ContactDetailsFormData) => void;
    requireEmail?: boolean;
};

function ContactDetailsForm({
    formData,
    fieldErrors = {},
    onChange,
    requireEmail = false,
}: ContactDetailsFormProps) {
    const {
        formState: { errors },
        control,
    } = useForm<ContactDetailsFormData>({
        resolver: zodResolver(contactDetailsFormSchema),
        defaultValues: formData,
        mode: 'onChange',
    });

    // Use useWatch to make inputs reactive to formData changes
    const formValues = useWatch<ContactDetailsFormData>({
        control,
    });

    return (
        <div
            style={{
                border: `1px solid ${getThemedColor('neutral', 300)}`,
                borderRadius: getThemedRadius(300),
                padding: `${getThemedSpacing(400)} ${getThemedSpacing(300)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(500),
            }}
        >
            <div>
                <h3
                    style={{
                        fontSize: getThemedFontSize(500),
                        fontWeight: 700,
                        color: getThemedColor('neutral', 800),
                    }}
                >
                    Your details
                </h3>
                <p
                    style={{
                        fontSize: getThemedFontSize(300),
                        color: getThemedColor('neutral', 900),
                        marginTop: getThemedSpacing(50),
                    }}
                >
                    We only use your details if you have opted in above.
                </p>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(600),
                }}
            >
                {/* First name and Last name row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: getThemedSpacing(400),
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemedSpacing(200),
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: getThemedSpacing(100),
                            }}
                        >
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 900),
                                }}
                            >
                                First name
                            </span>
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: '#c11101',
                                }}
                            >
                                *
                            </span>
                        </div>
                        <TextInput
                            value={formValues.firstName ?? ''}
                            onChange={(e) => onChange({ ...formData, firstName: e.target.value })}
                            errorMessage={fieldErrors.firstName ?? errors.firstName?.message}
                        />
                        <FieldErrorDisplay
                            error={fieldErrors.firstName ?? errors.firstName?.message}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemedSpacing(200),
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: getThemedSpacing(100),
                            }}
                        >
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 900),
                                }}
                            >
                                Last name
                            </span>
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: '#c11101',
                                }}
                            >
                                *
                            </span>
                        </div>
                        <TextInput
                            value={formValues.lastName ?? ''}
                            onChange={(e) => onChange({ ...formData, lastName: e.target.value })}
                            errorMessage={fieldErrors.lastName ?? errors.lastName?.message}
                        />
                        <FieldErrorDisplay
                            error={fieldErrors.lastName ?? errors.lastName?.message}
                        />
                    </div>
                </div>

                {/* Organization and Job title row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: getThemedSpacing(400),
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemedSpacing(200),
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: getThemedSpacing(100),
                            }}
                        >
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 900),
                                }}
                            >
                                Organization
                            </span>
                            <span
                                style={{
                                    fontSize: getThemedFontSize(300),
                                    color: getThemedColor('neutral', 700),
                                }}
                            >
                                (optional)
                            </span>
                        </div>
                        <TextInput
                            value={formValues.organization ?? ''}
                            onChange={(e) =>
                                onChange({ ...formData, organization: e.target.value })
                            }
                            errorMessage={fieldErrors.organization ?? errors.organization?.message}
                        />
                        <FieldErrorDisplay
                            error={fieldErrors.organization ?? errors.organization?.message}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemedSpacing(200),
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: getThemedSpacing(100),
                            }}
                        >
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 900),
                                }}
                            >
                                Job title
                            </span>
                            <span
                                style={{
                                    fontSize: getThemedFontSize(300),
                                    color: getThemedColor('neutral', 700),
                                }}
                            >
                                (optional)
                            </span>
                        </div>
                        <TextInput
                            value={formValues.jobTitle ?? ''}
                            onChange={(e) => onChange({ ...formData, jobTitle: e.target.value })}
                            errorMessage={fieldErrors.jobTitle ?? errors.jobTitle?.message}
                        />
                        <FieldErrorDisplay
                            error={fieldErrors.jobTitle ?? errors.jobTitle?.message}
                        />
                    </div>
                </div>

                {/* Email field */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: getThemedSpacing(200),
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: getThemedSpacing(100),
                        }}
                    >
                        <span
                            style={{
                                fontSize: getThemedFontSize(400),
                                color: getThemedColor('neutral', 900),
                            }}
                        >
                            Email
                        </span>
                        {requireEmail && (
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: '#c11101',
                                }}
                            >
                                *
                            </span>
                        )}
                    </div>
                    <TextInput
                        type="email"
                        value={formValues.email ?? ''}
                        onChange={(e) => onChange({ ...formData, email: e.target.value })}
                        errorMessage={fieldErrors.email ?? errors.email?.message}
                    />
                    <FieldErrorDisplay error={fieldErrors.email ?? errors.email?.message} />
                </div>
            </div>
        </div>
    );
}

export default ContactDetailsForm;
