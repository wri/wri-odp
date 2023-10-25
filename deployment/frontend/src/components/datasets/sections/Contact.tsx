import Image from "next/image";

const team = [
  {
    name: "Mr. Someone",
    img: "/images/placeholders/people/1.avif",
    title: "Creator",
    email: "mrsomeone@gmail.com",
  },
  {
    name: "Mr. Someone",
    img: "/images/placeholders/people/2.avif",
    title: "Creator",
    email: "mrsomeone@gmail.com",
  },
  {
    name: "Mr. Someone",
    img: "/images/placeholders/people/3.avif",
    title: "Creator",
    email: "mrsomeone@gmail.com",
  },
];

export function Contact() {
  return (
    <div className="grid gap-4 md:grid-cols-2 pr-4 sm:pr-6">
      {team.map((member) => (
        <TeamMember
          name={member.name}
          img={member.img}
          title={member.title}
          email={member.email}
        />
      ))}
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
    <div className="grid md:grid-cols-3 mb-2">
      <div className="col-span-1 relative h-24 w-24">
        <Image alt={`${name} Avatar`} fill src={img} />
      </div>
      <div className="col-span-2 font-acumin ml-4 flex flex-col justify-center">
      <div className="text-sm font-semibold text-black">{title}</div>
      <div className="text-sm font-normal text-black">{name}</div>
      <div className="text-sm font-normal text-black">{email}</div>
      </div>
    </div>
  );
}
