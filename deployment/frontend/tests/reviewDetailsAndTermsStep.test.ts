import { describe, expect, it } from 'vitest';
import {
    initialReviewDetailsAndTermsFormData,
    validateReviewDetailsAndTermsForm,
    type ReviewDetailsAndTermsFormData,
} from '@/components/datasets-v2/DatasetDetailsHeader/ApiAndDownloadModalSteps/reviewDetailsAndTermsStep.utils';

const validForm: ReviewDetailsAndTermsFormData = {
    ...initialReviewDetailsAndTermsFormData,
    email: 'ada@wri.org',
    country: { label: 'Peru', value: 'PER' },
    affiliation: {
        label: 'Academic/Research Organization',
        value: 'Academic/Research Organization',
    },
    useCase: 'Research on forest loss.',
};

describe('validateReviewDetailsAndTermsForm', () => {
    it('accepts a complete form without contact details', () => {
        expect(validateReviewDetailsAndTermsForm(validForm)).toEqual({});
    });

    it('requires first and last name when the user opts in to updates', () => {
        const errors = validateReviewDetailsAndTermsForm({
            ...validForm,
            subscribeUpdates: true,
        });

        expect(errors.firstName).toBe('First name is required.');
        expect(errors.lastName).toBe('Last name is required.');
    });

    it('requires first and last name when the user opts in to research contact', () => {
        const errors = validateReviewDetailsAndTermsForm({
            ...validForm,
            contactForResearch: true,
        });

        expect(errors.firstName).toBe('First name is required.');
        expect(errors.lastName).toBe('Last name is required.');
    });

    it('accepts contact details once both names are provided', () => {
        const errors = validateReviewDetailsAndTermsForm({
            ...validForm,
            subscribeUpdates: true,
            firstName: 'Ada',
            lastName: 'Lovelace',
        });

        expect(errors).toEqual({});
    });

    it('rejects a malformed optional email', () => {
        const errors = validateReviewDetailsAndTermsForm(
            { ...validForm, email: 'not-an-email' },
            { requireEmail: false }
        );

        expect(errors.email).toBe('Enter a valid email.');
    });

    it('requires an email when the download is delivered by email', () => {
        const errors = validateReviewDetailsAndTermsForm(
            { ...validForm, email: '' },
            { requireEmail: true }
        );

        expect(errors.email).toBe('Enter a valid email.');
    });
});
