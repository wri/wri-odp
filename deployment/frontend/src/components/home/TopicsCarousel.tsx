import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import CarouselNavButton from '../_shared/CarouselNavButton'
import SubtopicCard from '../topics/SubtopicCard'
import Image from 'next/image'
import { AutoCarousel } from '../_shared/AutoCarousel'
import Link from 'next/link'
import { api } from '@/utils/api'
import { ErrorAlert } from '../_shared/Alerts'
import Spinner from '../_shared/Spinner'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'

function TopicCard({
    topic,
    topicDetails,
}: {
    topic: GroupTree
    topicDetails: Record<string, GroupsmDetails>
}) {
    const datasetCount = topicDetails[topic.id]?.package_count
    return (
        <Link
            href={`/topics/${topic.name}`}
            className="flex w-full flex-col gap-1 pr-4 font-acumin "
        >
            <div className="relative aspect-square h-72 w-full bg-white">
                <Image
                    src={`${
                        topicDetails[topic.id]?.img_url
                            ? topicDetails[topic.id]?.img_url
                            : '/images/placeholders/topics/topicsdefault.png'
                    }`}
                    alt={`Topic - ${topic.title}`}
                    fill
                    className="object-contain"
                />
            </div>
            <p className="font-['Acumin Pro SemiCondensed'] text-xl font-semibold text-black">
                {topic.title}
            </p>
            <p className="font-['Acumin Pro SemiCondensed'] w-24 text-base font-semibold text-green-700">
                {datasetCount && datasetCount > 1
                    ? `${datasetCount} datasets`
                    : `${datasetCount} dataset`}
            </p>
        </Link>
    )
}

export function TopicsCarousel() {
    const { data, isLoading, error } = api.topics.getGeneralTopics.useQuery({
        search: '',
        page: { start: 0, rows: 50 },
        allTree: true,
    })
    return (
        <div className="relative">
            <div className="peer">
                <AutoCarousel
                    name="topics"
                    prevButton={<PrevButton />}
                    nextButton={<NextButton />}
                >
                    {error && (
                        <ErrorAlert
                            title="Error loading topics"
                            text={error.message}
                        />
                    )}

                    {isLoading && (
                        <div className="w-full flex justify-center">
                            <Spinner />
                        </div>
                    )}

                    {data?.topics.map((topic, index) => (
                        <SwiperSlide key={index} className="">
                            <TopicCard
                                topic={topic}
                                topicDetails={data.topicDetails}
                            />
                        </SwiperSlide>
                    ))}
                </AutoCarousel>
            </div>
        </div>
    )
}

const PrevButton = () => (
    <div
        className={`nav-prev-button--topics absolute top-[40%] z-50 ml-[-1.9rem] hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:left-0 lg:block`}
    >
        <CarouselNavButton orientation="left" />
    </div>
)

const NextButton = () => (
    <div
        className={`nav-next-button--topics right-[calc(0px + 3.3rem)] absolute top-[40%] z-50 hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:right-0 lg:block`}
    >
        <CarouselNavButton orientation="right" />
    </div>
)
