import Search from "@/components/Search";
import Footer from "@/components/_shared/Footer";
import Header from "@/components/_shared/Header";
import DatasetCard from "@/components/search/DatasetCard";
import FilteredSearchLayout from "@/components/search/FilteredSearchLayout";
import FiltersSelected from "@/components/search/FiltersSelected";
import Pagination from "@/components/search/Pagination";
import SortBy from "@/components/search/SortBy";

export default function SearchPage() {
  return (
    <>
      <Header />
      <Search />
      <FilteredSearchLayout>
        <SortBy />
        <FiltersSelected />
        <div className="grid grid-cols-1 @7xl:grid-cols-2 gap-4 py-4">
        {[0, 1, 2, 3, 4, 5].map((number) => (
          <DatasetCard key={number} />
        ))}
        </div>
        <Pagination />
      </FilteredSearchLayout>
      <Footer />
    </>
  );
}
