import Team from "@/interfaces/team.interface";
import CardsGrid from "../_shared/CardsGrid";
import Container from "../_shared/Container";
import TeamCard from "./TeamCard";
import Pagination from "../_shared/Pagination";

const teams: Array<Team> = [
  {
    name: "team-1",
    title: "Team 1",
    image: "/images/placeholders/teams/team1.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-2",
    title: "Team 2",
    image: "/images/placeholders/teams/team2.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-3",
    title: "Team 3",
    image: "/images/placeholders/teams/team3.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-4",
    title: "Team 4",
    image: "/images/placeholders/teams/team4.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-5",
    title: "Team 5",
    image: "/images/placeholders/teams/team5.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-6",
    title: "Team 6",
    image: "/images/placeholders/teams/team6.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-7",
    title: "Team 7",
    image: "/images/placeholders/teams/team7.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-8",
    title: "Team 8",
    image: "/images/placeholders/teams/team8.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-9",
    title: "Team 9",
    image: "/images/placeholders/teams/team1.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-10",
    title: "Team 10",
    image: "/images/placeholders/teams/team2.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-11",
    title: "Team 11",
    image: "/images/placeholders/teams/team3.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-12",
    title: "Team 12",
    image: "/images/placeholders/teams/team4.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-13",
    title: "Team 13",
    image: "/images/placeholders/teams/team5.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
  {
    name: "team-14",
    title: "Team 14",
    image: "/images/placeholders/teams/team6.png",
    num_datasets: 32,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?",
  },
];

export default function TeamsSearchResults() {
  return (
    <Container className="mb-28">
      <span className="font-semibold text-xl">{teams.length} teams</span>
      <CardsGrid<Team>
        className="mt-5 mb-5"
        items={teams}
        Card={({ item: team }) => {
          return <TeamCard team={team} />;
        }}
      />
      <Pagination />
    </Container>
  );
}
