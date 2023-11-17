import { WriDataset } from "@/schema/ckan.schema";
import Image from "next/image";

export function Contact({ dataset }: { dataset: WriDataset }) {
  return (
    <div className="grid grid-cols-2 gap-4 min-h-[300px] items-start">
        <TeamMember
          name={dataset.author ?? ''}
          img='/images/placeholders/user/userdefault.png'
          title="Author"
          email={dataset.author_email ?? ''}
        />
        <TeamMember
          name={dataset.maintainer ?? ''}
          img='/images/placeholders/user/userdefault.png'
          title="Maintainer"
          email={dataset.maintainer_email ?? ''}
        />
    </div>
  );
}

interface TeamMemberProps {
  name: string;
  img: string;
  title: string;
  email: string;
}

function TeamMember({ name, img, title, email }: TeamMemberProps) {
  return (
    <div className="mb-2 grid md:grid-cols-3">
      <div>
        <div className="relative col-span-1 h-24 w-24 sm:w-auto">
          <Image alt={`${name} Avatar`} fill src={img} />
        </div>
      </div>
      <div className="col-span-2 flex flex-col justify-center font-acumin sm:ml-2">
        <div className="text-sm font-semibold text-black">{title}</div>
        <div className="text-sm font-normal text-black">{name}</div>
        <div className="text-sm font-normal text-black">{email}</div>
      </div>
    </div>
  );
}
