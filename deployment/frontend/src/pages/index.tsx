import Highlights from "@/components/Highlights";
import { Button } from "@/components/_shared/Button";
import { CTA } from "@/components/home/CTA";
import { Hero } from "@/components/home/Hero";
import { HighlightsCarousel } from "@/components/home/HighlightsCarousel";
import { TopicsCarousel } from "@/components/home/TopicsCarousel";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>WRI - ODP</title>
      </Head>
      <Hero />
      <main className="default-container gap-x-[4.25rem] mx-auto grid grid-cols-1 py-24 md:grid-cols-5">
        <div className="col-span-2">
          <div className="default-container w-full border-t-[4px] border-stone-900" />
          <h3 className="pt-1 font-acumin text-2xl font-bold leading-loose text-stone-900">
            About the portal
          </h3>
        </div>
        <div className="col-span-3 flex flex-col gap-y-4">
          <p className="font-acumin text-xl font-light leading-loose text-neutral-700">
            This is an open data portal which aggregates data from X Y Z places,
            data, organizations and blahblahblah. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore. Lorem ipsum dolor sit amet, consectetur adipiscing
            elit, sed do eiusmod tempor incididunt ut labore et dolore. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore.
          </p>
          <Button className="mr-auto">Read More</Button>
        </div>
      </main>
      <main className="flex min-h-screen flex-col items-center justify-center gap-y-8 bg-neutral-50 py-20">
        <div className="topics-carousel relative !ml-auto w-full max-w-[94.5vw] py-10">
          <h3 className="font-acumin text-2xl font-bold leading-loose text-stone-900">
            Explore Topic
          </h3>
          <div className="py-4">
            <TopicsCarousel />
          </div>
        </div>
        <div className="highlights-carousel relative !ml-auto w-full max-w-[94.5vw]">
          <div className="default-container w-full border-t-[4px] border-stone-900" />
          <h3 className="pt-1 font-acumin text-2xl font-bold leading-loose text-stone-900">
            Highlights
          </h3>
          <div className="py-4">
            <HighlightsCarousel />
          </div>
        </div>
      </main>
      <CTA />
    </>
  );
}
