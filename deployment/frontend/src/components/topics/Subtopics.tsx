import { SwiperSlide } from 'swiper/react'
import Carousel from '../Carousel'
import SubtopicCard from './SubtopicCard'
import CarouselNavButton from '../_shared/CarouselNavButton'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'

const subtopics = [
    {
        title: 'Subtopic 1',
        numOfDatasets: 163,
        img: '/images/topics/2.png',
    },
    {
        title: 'Subtopic 2',
        numOfDatasets: 163,
        img: '/images/topics/3.png',
    },
    {
        title: 'Subtopic 3',
        numOfDatasets: 163,
        img: '/images/topics/4.png',
    },
    {
        title: 'Subtopic 4',
        numOfDatasets: 163,
        img: '/images/topics/5.png',
    },
    {
        title: 'Subtopic 5',
        numOfDatasets: 163,
        img: '/images/topics/6.png',
    },
    {
        title: 'Subtopic 6',
        numOfDatasets: 163,
        img: '/images/topics/7.png',
    },
    {
        title: 'Subtopic 7',
        numOfDatasets: 163,
        img: '/images/topics/2.png',
    },
    {
        title: 'Subtopic 8',
        numOfDatasets: 163,
        img: '/images/topics/3.png',
    },
    {
        title: 'Subtopic 9',
        numOfDatasets: 163,
        img: '/images/topics/4.png',
    },
]
export default function Subtopics({
    topics,
    topicsDetails,
}: {
    topics?: GroupTree[]
    topicsDetails: Record<string, GroupsmDetails>
}) {
    topics = topics as GroupTree[]
    const topic = topics[0] as GroupTree
    return (
        <section
            id="subtopics"
            className=" mx-auto mt-8 flex  max-w-[1380px] flex-col gap-y-6 px-4 font-acumin sm:px-6 lg:mt-16 xxl:px-0"
        >
            <h1 className="font-['Acumin Pro SemiCondensed'] truncate whitespace-normal text-2xl font-semibold text-black">
                Subtopics ({topic.children.length})
            </h1>
            <div className="relative">
                <div className="peer">
                    <Carousel
                        identifier="subtopics"
                        breakpoints={{
                            1: {
                                slidesPerView: 1,
                                slidesPerGroup: 1,
                            },
                            450: {
                                slidesPerView: 2,
                                slidesPerGroup: 2,
                            },
                            720: {
                                slidesPerView: 3,
                                slidesPerGroup: 3,
                            },
                            1024: {
                                slidesPerView: 4,
                                slidesPerGroup: 4,
                            },
                            1240: {
                                slidesPerView: 5,
                                slidesPerGroup: 5,
                            },
                            1440: {
                                slidesPerView: 6,
                                slidesPerGroup: 6,
                            },
                        }}
                    >
                        {topic.children.map((subtopic, index) => {
                            return (
                                <SwiperSlide key={index} className="">
                                    <SubtopicCard
                                        topic={subtopic}
                                        topicsDetails={topicsDetails}
                                    />
                                </SwiperSlide>
                            )
                        })}
                    </Carousel>
                </div>
                <div
                    className={`nav-prev-button--subtopics absolute top-[35%] z-50 ml-[-1.9rem] hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:left-0 lg:block`}
                >
                    <CarouselNavButton orientation="left" />
                </div>
                <div
                    className={`nav-next-button--subtopics absolute top-[35%] z-50 mr-[-1.9rem] hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:right-0 lg:block`}
                >
                    <CarouselNavButton orientation="right" />
                </div>
            </div>
        </section>
    )
}
