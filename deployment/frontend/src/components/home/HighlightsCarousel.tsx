import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import CarouselNavButton from '../_shared/CarouselNavButton'
import HighlightCard from '../HighlightCard'
import { AutoCarousel } from '../_shared/AutoCarousel'
import { WriDataset } from '@/schema/ckan.schema'

export interface TopicProps {
    title: string
    numOfDatasets: number
    img: string
}

const highlights = [
    {
        title: 'Title of the dataset goes here lorem ipsum.',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.',
        date: '2020 - 2023',
        location: 'Sub-regional',
        tag: 'FORESTS',
        img: '/images/map.png',
    },
    {
        title: 'Title of the dataset goes here lorem ipsum.',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.',
        date: '2020 - 2023',
        location: 'Sub-regional',
        tag: 'FORESTS',
        img: '/images/map1.png',
    },
    {
        title: 'Title of the dataset goes here lorem ipsum.',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.',
        date: '2020 - 2023',
        location: 'Sub-regional',
        tag: 'FORESTS',
        img: '/images/map2.png',
    },
    {
        title: 'Title of the dataset goes here lorem ipsum.',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.',
        date: '2020 - 2023',
        location: 'Sub-regional',
        tag: 'FORESTS',
        img: '/images/map3.png',
    },
    {
        title: 'Title of the dataset goes here lorem ipsum.',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.',
        date: '2020 - 2023',
        location: 'Sub-regional',
        tag: 'FORESTS',
        img: '/images/map.png',
    },
    {
        title: 'Title of the dataset goes here lorem ipsum.',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.',
        date: '2020 - 2023',
        location: 'Sub-regional',
        tag: 'FORESTS',
        img: '/images/map1.png',
    },
    {
        title: 'Title of the dataset goes here lorem ipsum.',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.',
        date: '2020 - 2023',
        location: 'Sub-regional',
        tag: 'FORESTS',
        img: '/images/map2.png',
    },
    {
        title: 'Title of the dataset goes here lorem ipsum.',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.',
        date: '2020 - 2023',
        location: 'Sub-regional',
        tag: 'FORESTS',
        img: '/images/map3.png',
    },
]

export function HighlightsCarousel() {
    return (
        <div className="relative">
            <div className="peer">
                <AutoCarousel
                    name="highlights"
                    prevButton={<PrevButton />}
                    nextButton={<NextButton />}
                >
                    {highlights.map((highlight, index) => (
                        <SwiperSlide key={index} className="">
                            <div className="w-72 pr-6">
                                <HighlightCard highlight={highlight as any} />
                            </div>
                        </SwiperSlide>
                    ))}
                </AutoCarousel>
            </div>
        </div>
    )
}

const PrevButton = () => (
    <div
        className={`nav-prev-button--highlights absolute top-[25%] z-50 ml-[-1.9rem] hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:left-0 lg:block`}
    >
        <CarouselNavButton orientation="left" />
    </div>
)

const NextButton = () => (
    <div
        className={`nav-next-button--highlights right-[calc(0px + 3.3rem)] absolute top-[25%] z-50 hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:right-0 lg:block`}
    >
        <CarouselNavButton orientation="right" />
    </div>
)
