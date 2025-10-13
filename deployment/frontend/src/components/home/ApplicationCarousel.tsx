import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import CarouselNavButton from '../_shared/CarouselNavButton';
import Image from 'next/image';
import { AutoCarousel } from '../_shared/AutoCarousel';
import Link from 'next/link';
import { api } from '@/utils/api';
import { ErrorAlert } from '../_shared/Alerts';
import Spinner from '../_shared/Spinner';
import {
    type Application,
    GroupTree,
    GroupsmDetails,
} from '@/schema/ckan.schema';
import { Group } from '@portaljs/ckan';

export function ApplicationCard({ application }: { application: Application }) {
    const datasetCount = application.package_count;
    return (
        <Link
            href={`/applications/${application.name}`}
            className="flex w-full flex-col gap-2 font-acumin pb-6"
        >
            <div className="relative aspect-square h-72 w-full bg-white">
                <Image
                    src={`${
                        application.image_display_url !== ''
                            ? application?.image_display_url
                            : '/images/placeholders/applications/applicationsdefault.png'
                    }`}
                    alt={`Application - ${application.title}`}
                    fill
                    className="object-cover"
                />
            </div>
            <p className="font-['Acumin Pro SemiCondensed'] text-xl font-semibold text-black pt-2">
                {application.title}
            </p>
            <p className="font-['Acumin Pro SemiCondensed'] w-24 text-base font-semibold text-green-700">
                {datasetCount && datasetCount > 1
                    ? `${datasetCount} Datasets`
                    : `${datasetCount} Dataset`}
            </p>
        </Link>
    );
}

export function ApplicationsCarousel() {
    const { data, isLoading, error } =
        api.applications.getAllApplications.useQuery();
    return (
        <div className="relative">
            <div className="peer">
                <AutoCarousel
                    name="applications"
                    prevButton={<PrevButton />}
                    nextButton={<NextButton />}
                >
                    {error && (
                        <ErrorAlert
                            title="Error loading Applications"
                            text={error.message}
                        />
                    )}

                    {isLoading && (
                        <div className="w-full flex justify-center">
                            <Spinner />
                        </div>
                    )}

                    {data
                        ?.filter((application) => {
                            const datasetCount = application.package_count;
                            return datasetCount > 0;
                        })
                        .map((application, index) => (
                            <SwiperSlide key={index} className="">
                                <div className=" w-80 pr-6">
                                    <ApplicationCard
                                        application={application}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                </AutoCarousel>
            </div>
        </div>
    );
}

const PrevButton = () => (
    <div
        className={`nav-prev-button--applications absolute top-[40%] z-50 ml-[-1.9rem] hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:left-0 lg:block`}
    >
        <CarouselNavButton orientation="left" />
    </div>
);

const NextButton = () => (
    <div
        className={`nav-next-button--applications right-[calc(0px + 3.3rem)] absolute top-[40%] z-50 hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:right-0 lg:block`}
    >
        <CarouselNavButton orientation="right" />
    </div>
);
