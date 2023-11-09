import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_shared/Table";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { PencilIcon } from "@heroicons/react/24/outline";

const users = [
  {
    user: "User 1",
    email: "User email",
    role: "Member",
  },
  {
    user: "User 2",
    email: "User email",
    role: "Member",
  },
  {
    user: "User 3",
    email: "User email",
    role: "Member",
  },
];

export function Members() {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-100">
            <TableHead className="font-acumin text-xs font-semibold text-black">
              User
            </TableHead>
            <TableHead className="font-acumin text-xs font-semibold text-black">
              Email
            </TableHead>
            <TableHead className="font-acumin text-xs font-semibold text-black">
              Role
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.user}
              className={index === 1 ? "bg-neutral-100" : ""}
            >
              <TableCell className="flex flex-col items-center gap-x-2 font-medium sm:flex-row">
                <div className="h-6 w-6 rounded-full bg-zinc-300" />
                {user.user}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell className="flex justify-end">
                <PencilIcon className="mr-4 h-5 w-5 text-black" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>{" "}
      <button className="ml-auto mt-4 flex items-center justify-end gap-x-1">
        <PlusCircleIcon className="h-5 w-5 text-amber-400" />
        <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
          Add another collaborator
        </span>
      </button>
    </>
  );
}
