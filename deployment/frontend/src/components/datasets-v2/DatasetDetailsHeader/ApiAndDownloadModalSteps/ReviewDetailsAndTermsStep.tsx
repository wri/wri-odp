import {
    Button,
    Checkbox,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
    Select,
    Textarea,
    TextInput,
} from '@worldresources/wri-design-systems';
import { type FormEvent, useState } from 'react';
import {
    affiliationOptions,
    countryOptions,
    getOptionByValue,
    initialReviewDetailsAndTermsFormData,
    type ReviewDetailsAndTermsFieldErrors,
    type ReviewDetailsAndTermsFormData,
    validateReviewDetailsAndTermsForm,
} from './reviewDetailsAndTermsStep.utils';

type ReviewDetailsAndTermsStepProps = {
    downloadMultipleFiles?: boolean;
    onBack: () => void;
    onContinue: (formData: ReviewDetailsAndTermsFormData) => Promise<void> | void;
    isSubmitting?: boolean;
};

export type { ReviewDetailsAndTermsFormData } from './reviewDetailsAndTermsStep.utils';

function ReviewDetailsAndTermsStep({
    onBack,
    onContinue,
    isSubmitting = false,
    downloadMultipleFiles = false,
}: ReviewDetailsAndTermsStepProps) {
    const [formData, setFormData] = useState<ReviewDetailsAndTermsFormData>(
        initialReviewDetailsAndTermsFormData
    );
    const [fieldErrors, setFieldErrors] = useState<ReviewDetailsAndTermsFieldErrors>({});
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    const isBusy = isSubmitting || isSubmittingForm;
    const shouldShowAdditionalContactFields =
        formData.subscribeUpdates || formData.contactForResearch;

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationErrors = validateReviewDetailsAndTermsForm(formData, {
            requireEmail: downloadMultipleFiles,
        });
        setFieldErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0 || !formData.acceptLicence) {
            return;
        }

        setIsSubmittingForm(true);
        try {
            await onContinue(formData);
        } finally {
            setIsSubmittingForm(false);
        }
    };

    return (
        <form
            onSubmit={submitForm}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(600),
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(200),
                }}
            >
                <h1
                    style={{
                        fontSize: getThemedFontSize(700),
                        fontWeight: 700,
                        color: getThemedColor('neutral', 900),
                    }}
                >
                    {'Review details & terms'}
                </h1>
                <p
                    style={{
                        fontSize: getThemedFontSize(400),
                        fontWeight: 400,
                        color: getThemedColor('neutral', 800),
                    }}
                >
                    Before we prepare your download, please review the information below.
                </p>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(500),
                }}
            >
                {downloadMultipleFiles && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: getThemedSpacing(50),
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: getThemedFontSize(600),
                                    fontWeight: 700,
                                    color: getThemedColor('neutral', 900),
                                    lineHeight: getThemedSpacing(700),
                                }}
                            >
                                Delivery details
                            </h2>
                            <p
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    fontWeight: 400,
                                    color: getThemedColor('neutral', 800),
                                }}
                            >
                                {
                                    "Because of the size of this download, we'll prepare a ZIP file and email you a download link when it's ready."
                                }
                            </p>
                        </div>
                        <div style={{ width: '50%' }}>
                            <TextInput
                                label="Email"
                                required
                                noMarginBottom
                                value={formData.email}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        email: event.target.value,
                                    }))
                                }
                                errorMessage={fieldErrors.email}
                            />
                        </div>
                        <hr
                            style={{
                                border: 'none',
                                borderTop: `1px solid ${getThemedColor('neutral', 300)}`,
                                margin: 0,
                            }}
                        />
                    </>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(500),
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: getThemedSpacing(50),
                    }}
                >
                    <h2
                        style={{
                            fontSize: getThemedFontSize(600),
                            fontWeight: 700,
                            color: getThemedColor('neutral', 900),
                            lineHeight: getThemedSpacing(700),
                        }}
                    >
                        Tell us about your use case
                    </h2>
                    <p
                        style={{
                            fontSize: getThemedFontSize(400),
                            fontWeight: 400,
                            color: getThemedColor('neutral', 800),
                        }}
                    >
                        This helps us understand how our data is being used so we can improve our
                        datasets.
                    </p>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: getThemedSpacing(500),
                    }}
                >
                    <Select
                        label="What country are you based in?"
                        required
                        items={countryOptions}
                        placeholder="Please select"
                        value={formData.country ? [formData.country.value] : []}
                        onChange={(value) =>
                            setFormData((current) => ({
                                ...current,
                                country: getOptionByValue(countryOptions, value[0]),
                            }))
                        }
                        errorMessage={fieldErrors.country}
                    />
                    <Select
                        label="What is your professional affiliation?"
                        required
                        items={affiliationOptions}
                        placeholder="Please select"
                        value={formData.affiliation ? [formData.affiliation.value] : []}
                        onChange={(value) =>
                            setFormData((current) => ({
                                ...current,
                                affiliation: getOptionByValue(affiliationOptions, value[0]),
                            }))
                        }
                        errorMessage={fieldErrors.affiliation}
                    />
                    {formData.affiliation?.value === 'Other' && (
                        <TextInput
                            label="Please describe your affiliation"
                            required
                            value={formData.otherAffiliation}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    otherAffiliation: event.target.value,
                                }))
                            }
                        />
                    )}
                    <Textarea
                        label="How will you use this data?"
                        required
                        maxLength={200}
                        value={formData.useCase}
                        onChange={(event) =>
                            setFormData((current) => ({
                                ...current,
                                useCase: event.target.value,
                            }))
                        }
                        errorMessage={fieldErrors.useCase}
                    />
                </div>
            </div>

            <hr
                style={{
                    border: 'none',
                    borderTop: `1px solid ${getThemedColor('neutral', 300)}`,
                    margin: 0,
                }}
            />

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(500),
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: getThemedSpacing(50),
                    }}
                >
                    <h2
                        style={{
                            fontSize: getThemedFontSize(600),
                            fontWeight: 700,
                            color: getThemedColor('neutral', 900),
                            lineHeight: getThemedSpacing(700),
                        }}
                    >
                        {'Licence terms & updates'}
                    </h2>
                    <p
                        style={{
                            fontSize: getThemedFontSize(400),
                            fontWeight: 400,
                            color: getThemedColor('neutral', 800),
                        }}
                    >
                        Please review the licence and let us know if you would like to receive
                        updates.
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: getThemedSpacing(400),
                    }}
                >
                    <div
                        style={{
                            marginLeft: getThemedSpacing(200),
                        }}
                    >
                        <Checkbox
                            checked={formData.acceptLicence}
                            onCheckedChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    acceptLicence: !!event.checked,
                                }))
                            }
                        >
                            <p
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 900),
                                }}
                            >
                                <span style={{ color: '#c11101' }}>* </span>
                                {"I agree to the dataset's "}
                                <a
                                    href="#"
                                    style={{
                                        textDecoration: 'underline',
                                        color: getThemedColor('neutral', 900),
                                    }}
                                >
                                    Licence Terms
                                </a>
                                .
                            </p>
                        </Checkbox>
                    </div>

                    <div
                        style={{
                            marginLeft: getThemedSpacing(200),
                        }}
                    >
                        <Checkbox
                            checked={formData.subscribeUpdates}
                            onCheckedChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    subscribeUpdates: !!event.checked,
                                }))
                            }
                        >
                            <div>
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
                                        {"I'd like to receive data and technology updates from WRI"}
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
                                <p
                                    style={{
                                        fontSize: getThemedFontSize(300),
                                        color: getThemedColor('neutral', 700),
                                        marginTop: getThemedSpacing(50),
                                    }}
                                >
                                    {
                                        "You'll receive occasional emails about new datasets, features and resources."
                                    }
                                </p>
                            </div>
                        </Checkbox>
                    </div>

                    <div
                        style={{
                            marginLeft: getThemedSpacing(200),
                        }}
                    >
                        <Checkbox
                            checked={formData.contactForResearch}
                            onCheckedChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    contactForResearch: !!event.checked,
                                }))
                            }
                        >
                            <div>
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
                                        {
                                            "I'd like to be contacted about future Data Explorer research"
                                        }
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
                                <p
                                    style={{
                                        fontSize: getThemedFontSize(300),
                                        color: getThemedColor('neutral', 700),
                                        marginTop: getThemedSpacing(50),
                                    }}
                                >
                                    We may reach out to invite you to take part in research to help
                                    us improve Data Explorer.
                                </p>
                            </div>
                        </Checkbox>
                    </div>
                </div>

                {shouldShowAdditionalContactFields && (
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
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: getThemedSpacing(400),
                                }}
                            >
                                <TextInput
                                    label="First name"
                                    noMarginBottom
                                    showOptionalLabel
                                    value={formData.firstName}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            firstName: event.target.value,
                                        }))
                                    }
                                />
                                <TextInput
                                    label="Last name"
                                    noMarginBottom
                                    showOptionalLabel
                                    value={formData.lastName}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            lastName: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: getThemedSpacing(400),
                                }}
                            >
                                <TextInput
                                    label="Organization"
                                    showOptionalLabel
                                    noMarginBottom
                                    value={formData.organization}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            organization: event.target.value,
                                        }))
                                    }
                                />
                                <TextInput
                                    label="Job title"
                                    showOptionalLabel
                                    noMarginBottom
                                    value={formData.jobTitle}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            jobTitle: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" size="default" onClick={onBack}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    size="default"
                    type="submit"
                    disabled={isBusy || !formData.acceptLicence}
                >
                    {isBusy ? 'Submitting...' : 'Continue'}
                </Button>
            </div>
        </form>
    );
}

export default ReviewDetailsAndTermsStep;
