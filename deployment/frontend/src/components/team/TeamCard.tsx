import React from "react";
import Image from "next/image";
import Team from "@/interfaces/team.interface";

export default function TeamCard({ team }: { team: Team }) {
  return (
    <a
      href={`/teams/${team.name}`}
      className="text-wri-black flex flex-col w-full font-acumin max-w-[400px] ml-auto mr-auto"
    >
      <div className="relative w-full p-5 lg:p-8 xl:p-10 h-56 2xl:h-64 shadow-md border-b-[2px] border-b-wri-green">
        <div className="w-full h-full relative">
          <Image
            src={`${team.image}`}
            alt={`Team - ${team.title}`}
            fill
            className="object-contain"
          />
        </div>
        <div className="bg-white w-[80%] absolute bottom-0 left-0 pt-2 -ml-[1px] -mb-[8px] z-10">
          <h2 className="text-2xl font-bold w-[80%]">{team.title}</h2>
        </div>
      </div>
      <article className=" line-clamp-3 w-[88%] font-light text-base mt-3 leading-[1.375rem] line-clamp-3">
        {team.description}
      </article>
      <div className="flex font-light text-sm text-wri-black mt-1 leading-[1.375rem] items-center">
        <span className="mr-2">{team.num_datasets} datasets</span>
      </div>
    </a>
  );
}
