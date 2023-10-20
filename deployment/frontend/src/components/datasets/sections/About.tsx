import { Button } from "@/components/_shared/Button";
import { LinkIcon } from "@heroicons/react/24/outline";

const tags = [
  "WRI",
  "Tag",
  "Another tag",
  "WRI",
  "Tag",
  "Another tag",
  "WRI",
  "Tag",
  "Another tag",
  "WRI",
  "Tag",
  "Another tag",
  "Last tag",
];

export function About() {
  return (
    <div className="flex flex-col gap-y-4 py-2 pr-4 sm:pr-6">
      <div className="font-acumin text-base font-normal text-black">
        Details
      </div>
      <div className="inline-flex gap-x-1 font-acumin text-sm font-semibold text-wri-green">
        <LinkIcon className="h-4 w-4" />
        Technical Notes
      </div>
      <div className="flex flex-wrap gap-[0.35rem]">
        {tags.map((tag) => (
          <Pill text={tag} />
        ))}
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-1">
          <dt className="font-acumin text-sm font-semibold text-neutral-700">
            {" "}
            Project:
          </dt>
          <dd className="mb-1 text-sm font-light text-stone-900">
            Ecosystem Service Mapping
          </dd>
        </div>
        <div className="flex items-center gap-x-1">
          <dt className="font-acumin text-sm font-semibold text-neutral-700">
            {" "}
            Topics:{" "}
          </dt>
          <dd className="mb-1 text-sm font-light text-stone-900">
            Climate, Energy, Governance, Action
          </dd>
        </div>
        <div className="flex items-center gap-x-1">
          <dt className="font-acumin text-sm font-semibold text-neutral-700">
            License:{" "}
          </dt>
          <dd className="mb-1 text-sm font-light text-stone-900">
            Creative Commons Attribution
          </dd>
        </div>
      </div>
      <div className="flex max-w-[36rem] flex-col gap-y-4">
        <div>
          <h3 className="font-acumin text-base font-normal text-black">
            Citation
          </h3>
          <p className="text-justify font-acumin text-sm font-light text-stone-900">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta
            sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla
            sed consectetur. Nullam quis risus eget urna mollis ornare vel eu
            leo.
          </p>
        </div>
        <div>
          <h3 className="font-acumin text-base font-normal text-black">
            Something else
          </h3>
          <p className="text-justify font-acumin text-sm font-light text-stone-900">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta
            sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla
            sed consectetur. Nullam quis risus eget urna mollis ornare vel eu
            leo.
          </p>
        </div>
        <Button className="mr-auto" variant="gray">Read More</Button>
      </div>
    </div>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <div className="rounded-sm border border-blue-800 bg-white px-3 py-[0.35rem] text-xs">
      {text}
    </div>
  );
}
