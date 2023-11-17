import HighlightCard from './HighlightCard'
import Carousel from './Carousel'
import { SwiperSlide } from 'swiper/react'
import CarouselNavButton from './_shared/CarouselNavButton'
import { api } from '@/utils/api'
import Spinner from './_shared/Spinner'
import { ErrorAlert } from './_shared/Alerts'

export default function Highlights() {
    const {
        data: featuredDatasets,
        isLoading: isLoadingFeaturedDatasets,
        error: errorFeaturedDatasets,
    } = api.dataset.getFeaturedDatasets.useQuery({
        search: '',
        page: { start: 0, rows: 100 },
        sortBy: 'metadata_modified desc',
        _isUserSearch: false,
    })

    return (
        <section
            id="highlights"
            className=" px-8 xxl:px-0  max-w-8xl mx-auto flex flex-col font-acumin gap-y-6 mt-16"
        >
            <h1 className="font-bold text-[2rem] ml-2 2xl:ml-2">Highlights</h1>
            <div className="relative ">
                <div className="peer">
                    <Carousel identifier="highlights">
                        {errorFeaturedDatasets && (
                            <ErrorAlert
                                title="Error loading highlight"
                                text={errorFeaturedDatasets.message}
                            />
                        )}
                        {isLoadingFeaturedDatasets && (
                            <div className="w-full flex justify-center">
                                <Spinner />
                            </div>
                        )}
                        {featuredDatasets?.datasets.map((highlight, index) => {
                            return (
                                <SwiperSlide key={index} className="">
                                    <HighlightCard highlight={highlight} />
                                </SwiperSlide>
                            )
                        })}
                    </Carousel>
                </div>
                <div
                    className={`transition-all opacity-0 peer-hover:opacity-100 hover:opacity-100 absolute hidden lg:block top-[20%] -translate-y-2/4 ml-[-1.9rem] md:left-0 z-50 nav-prev-button--highlights`}
                >
                    <CarouselNavButton orientation="left" />
                </div>
                <div
                    className={`transition-all opacity-0 peer-hover:opacity-100 hover:opacity-100 absolute hidden lg:block top-[20%] -translate-y-2/4 mr-[-1.9rem] md:right-0 z-50 nav-next-button--highlights`}
                >
                    <CarouselNavButton orientation="right" />
                </div>
            </div>
        </section>
    )
}
