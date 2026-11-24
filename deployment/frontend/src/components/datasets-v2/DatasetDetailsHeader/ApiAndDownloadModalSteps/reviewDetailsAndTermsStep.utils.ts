import { countries } from '@/utils/listOfCountries';

export type SelectOption = {
    label: string;
    value: string;
};

export type ReviewDetailsAndTermsFormData = {
    email: string;
    country: SelectOption | null;
    affiliation: SelectOption | null;
    otherAffiliation: string;
    useCase: string;
    acceptLicence: boolean;
    subscribeUpdates: boolean;
    contactForResearch: boolean;
    firstName: string;
    lastName: string;
    organization?: string;
    jobTitle?: string;
};

export type ReviewDetailsAndTermsFieldErrors = Partial<
    Record<'email' | 'country' | 'affiliation' | 'useCase' | 'firstName' | 'lastName', string>
>;

export const affiliationOptions: SelectOption[] = [
    'Government',
    'Donor Institution/Agency',
    'Local NGO (National or Subnational)',
    'International NGO',
    'UN or International Organization',
    'Academic/Research Organization',
    'Journalist/Media Organization',
    'Indigenous or Community-Based Organization',
    'Private Sector',
    'No Affiliation',
    'Other',
].map((option) => ({ label: option, value: option }));

export const countryOptions: SelectOption[] = countries.map((country) => ({
    label: country.name,
    value: country.iso,
}));

export const initialReviewDetailsAndTermsFormData: ReviewDetailsAndTermsFormData = {
    email: '',
    country: null,
    affiliation: null,
    otherAffiliation: '',
    useCase: '',
    acceptLicence: false,
    subscribeUpdates: false,
    contactForResearch: false,
    firstName: '',
    lastName: '',
    organization: undefined,
    jobTitle: undefined,
};

export const getOptionByValue = (options: SelectOption[], value?: string) => {
    if (!value) {
        return null;
    }

    return options.find((option) => option.value === value) ?? null;
};

export const validateReviewDetailsAndTermsForm = (
    formData: ReviewDetailsAndTermsFormData,
    options?: {
        requireEmail?: boolean;
    }
): ReviewDetailsAndTermsFieldErrors => {
    const errors: ReviewDetailsAndTermsFieldErrors = {};
    const requireEmail = options?.requireEmail ?? true;
    const wantsContact = formData.subscribeUpdates || formData.contactForResearch;

    // The email input is only rendered when the selection needs email delivery
    // (Data API tile sets). Anywhere else it is hidden, so it must not be
    // required — otherwise the form would be impossible to submit.
    if (requireEmail && (!formData.email.trim() || !formData.email.includes('@'))) {
        errors.email = 'Enter a valid email.';
    } else if (formData.email.trim() && !formData.email.includes('@')) {
        errors.email = 'Enter a valid email.';
    }

    if (!formData.country?.value) {
        errors.country = 'Required.';
    }

    if (!formData.affiliation?.value) {
        errors.affiliation = 'Required.';
    }

    if (formData.affiliation?.value === 'Other' && !formData.otherAffiliation.trim()) {
        errors.affiliation = 'Please describe your affiliation.';
    }

    if (!formData.useCase.trim()) {
        errors.useCase = 'Required.';
    }

    // Contact details are only collected when the user opts in to updates or research.
    if (wantsContact) {
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required.';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required.';
        }
    }

    return errors;
};
