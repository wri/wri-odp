import Header from "@/components/_shared/Header";
import Footer from "@/components/_shared/Footer";
import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";
import DatasetHorizontalCard from "@/components/search/DatasetHorizontalCard";
import { Hero } from "@/components/topics/Hero";
import Pagination from "@/components/_shared/Pagination";
import Subtopics from "@/components/topics/Subtopics";

const links = [
  { label: "Topics", url: "/topics", current: false },
  { label: "Topics 1", url: "/topics/test", current: true },
];

export default function TopicPage() {
  return (
    <>
      <Header />
      <Breadcrumbs links={links} />
      <Hero />
      <Subtopics />
      <div className="mx-auto grid w-full max-w-[1380px] gap-y-4 px-4 mt-20 font-acumin sm:px-6 xxl:px-0">
        <div className="font-['Acumin Pro SemiCondensed'] text-2xl font-semibold text-black truncate whitespace-normal">
          Datasets associated with Topic 1 (784)
        </div>
        {[0, 1, 2, 3, 4, 5].map((number) => (
          <DatasetHorizontalCard key={number} />
        ))}
        <Pagination />
      </div>
      <Footer />
    </>
  );
}
