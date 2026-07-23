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

type ReviewDetailsAndTermsStepProps = {
    onBack: () => void;
    onContinue: () => void;
};

function ReviewDetailsAndTermsStep({ onBack, onContinue }: ReviewDetailsAndTermsStepProps) {
    return (
        <div
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
                    <TextInput label="Email" required noMarginBottom />
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
                        items={[]}
                        placeholder="Please select"
                    />
                    <Select
                        label="What is your professional affiliation?"
                        required
                        items={[]}
                        placeholder="Please select"
                    />
                    <Textarea label="How will you use this data?" required maxLength={200} />
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
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: getThemedSpacing(200),
                        }}
                    >
                        <Checkbox defaultChecked />
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
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: getThemedSpacing(200),
                        }}
                    >
                        <Checkbox defaultChecked />
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
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: getThemedSpacing(200),
                        }}
                    >
                        <Checkbox defaultChecked />
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
                                    {"I'd like to be contacted about future Data Explorer research"}
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
                                We may reach out to invite you to take part in research to help us
                                improve Data Explorer.
                            </p>
                        </div>
                    </div>
                </div>

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
                            <TextInput label="First name" required noMarginBottom />
                            <TextInput label="Last name" required noMarginBottom />
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: getThemedSpacing(400),
                            }}
                        >
                            <TextInput label="Organization" showOptionalLabel noMarginBottom />
                            <TextInput label="Job title" showOptionalLabel noMarginBottom />
                        </div>
                        <TextInput label="Email" required noMarginBottom />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" size="default" onClick={onBack}>
                    Back
                </Button>
                <Button variant="primary" size="default" onClick={onContinue}>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default ReviewDetailsAndTermsStep;
