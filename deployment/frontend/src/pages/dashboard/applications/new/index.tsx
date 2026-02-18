import Header from '@/components/_shared/Header';
import CreateApplicationForm from '@/components/dashboard/applications/forms/CreateApplicationForm';
import { NextSeo } from 'next-seo';

export default function NewApplicationPage() {
    return (
        <>
            <NextSeo title={`Create Application`} />
            <Header />
            <CreateApplicationForm />
        </>
    );
}
