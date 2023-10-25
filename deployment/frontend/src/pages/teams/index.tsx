import Header from "@/components/_shared/Header";
import Footer from "@/components/_shared/Footer";
import TeamsSearch from "@/components/team/TeamsSearch";
import TeamsSearchResults from "@/components/team/TeamsSearchResults";

export default function TeamsPage() {

  return (
    <>
      <Header />
      <TeamsSearch />
      <TeamsSearchResults />
      <Footer
        links={{
          primary: { title: "Advanced Search", href: "/search" },
          secondary: { title: "Explore Topics", href: "/topics" },
        }}
      />
    </>
  );
}
