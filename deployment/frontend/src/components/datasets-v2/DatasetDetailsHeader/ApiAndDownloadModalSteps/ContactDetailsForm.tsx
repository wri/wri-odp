import { zodResolver } from '@hookform/resolvers/zod';
import {
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { useForm } from 'react-hook-form';
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
        register,
        formState: { errors },
    } = useForm<ContactDetailsFormData>({
        resolver: zodResolver(contactDetailsFormSchema),
        defaultValues: formData,
        mode: 'onChange',
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
                        <div
                            style={{
                                backgroundColor: getThemedColor('neutral', 100),
                                border: `1px solid ${getThemedColor('neutral', 400)}`,
                                borderRadius: getThemedRadius(300),
                                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
                                height: '40px',
                                padding: getThemedSpacing(300),
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="text"
                                {...register('firstName', {
                                    onChange: (e) =>
                                        onChange({ ...formData, firstName: e.target.value }),
                                })}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    width: '100%',
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 800),
                                    fontFamily: 'var(--style/regular-font, "Acumin_Pro:Regular")',
                                }}
                                placeholder=""
                            />
                        </div>
                        <FieldErrorDisplay
                            error={fieldErrors.firstName || errors.firstName?.message}
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
                        <div
                            style={{
                                backgroundColor: getThemedColor('neutral', 100),
                                border: `1px solid ${getThemedColor('neutral', 400)}`,
                                borderRadius: getThemedRadius(300),
                                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
                                height: '40px',
                                padding: getThemedSpacing(300),
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="text"
                                {...register('lastName', {
                                    onChange: (e) =>
                                        onChange({ ...formData, lastName: e.target.value }),
                                })}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    width: '100%',
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 800),
                                    fontFamily: 'var(--style/regular-font, "Acumin_Pro:Regular")',
                                }}
                                placeholder=""
                            />
                        </div>
                        <FieldErrorDisplay
                            error={fieldErrors.lastName || errors.lastName?.message}
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
                        <div
                            style={{
                                backgroundColor: getThemedColor('neutral', 100),
                                border: `1px solid ${getThemedColor('neutral', 400)}`,
                                borderRadius: getThemedRadius(300),
                                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
                                height: '40px',
                                padding: getThemedSpacing(300),
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="text"
                                {...register('organization', {
                                    onChange: (e) =>
                                        onChange({ ...formData, organization: e.target.value }),
                                })}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    width: '100%',
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 800),
                                    fontFamily: 'var(--style/regular-font, "Acumin_Pro:Regular")',
                                }}
                                placeholder=""
                            />
                        </div>
                        <FieldErrorDisplay
                            error={fieldErrors.organization || errors.organization?.message}
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
                        <div
                            style={{
                                backgroundColor: getThemedColor('neutral', 100),
                                border: `1px solid ${getThemedColor('neutral', 400)}`,
                                borderRadius: getThemedRadius(300),
                                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
                                height: '40px',
                                padding: getThemedSpacing(300),
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="text"
                                {...register('jobTitle', {
                                    onChange: (e) =>
                                        onChange({ ...formData, jobTitle: e.target.value }),
                                })}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    width: '100%',
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 800),
                                    fontFamily: 'var(--style/regular-font, "Acumin_Pro:Regular")',
                                }}
                                placeholder=""
                            />
                        </div>
                        <FieldErrorDisplay
                            error={fieldErrors.jobTitle || errors.jobTitle?.message}
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
                    <div
                        style={{
                            backgroundColor: getThemedColor('neutral', 100),
                            border: `1px solid ${getThemedColor('neutral', 400)}`,
                            borderRadius: getThemedRadius(300),
                            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
                            height: '40px',
                            padding: getThemedSpacing(300),
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <input
                            type="email"
                            {...register('email', {
                                onChange: (e) => onChange({ ...formData, email: e.target.value }),
                            })}
                            style={{
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                width: '100%',
                                fontSize: getThemedFontSize(400),
                                color: getThemedColor('neutral', 800),
                                fontFamily: 'var(--style/regular-font, "Acumin_Pro:Regular")',
                            }}
                            placeholder=""
                        />
                    </div>
                    <FieldErrorDisplay error={fieldErrors.email || errors.email?.message} />
                </div>
            </div>
        </div>
    );
}

export default ContactDetailsForm;
