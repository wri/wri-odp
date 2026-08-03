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
    organization: string;
    jobTitle: string;
};

export type ReviewDetailsAndTermsFieldErrors = Partial<
    Record<'email' | 'country' | 'affiliation' | 'useCase', string>
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
    organization: '',
    jobTitle: '',
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

    if (requireEmail && (!formData.email.trim() || !formData.email.includes('@'))) {
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

    return errors;
};
