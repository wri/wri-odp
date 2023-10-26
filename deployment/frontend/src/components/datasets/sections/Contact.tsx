import Image from "next/image";

const team = [
  {
    name: "Mr. Someone 1",
    img: "/images/placeholders/people/1.avif",
    title: "Creator",
    email: "mrsomeone@gmail.com",
  },
  {
    name: "Mr. Someone 2",
    img: "/images/placeholders/people/2.avif",
    title: "Creator",
    email: "mrsomeone@gmail.com",
  },
  {
    name: "Mr. Someone 3",
    img: "/images/placeholders/people/3.avif",
    title: "Creator",
    email: "mrsomeone@gmail.com",
  },
];

export function Contact() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {team.map((member) => (
        <TeamMember
          key ={member.name}
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
