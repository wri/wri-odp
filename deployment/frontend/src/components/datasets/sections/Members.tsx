import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_shared/Table";
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
    <Table>
      <TableHeader>
        <TableRow className="bg-neutral-100">
          <TableHead className="text-black text-xs font-semibold font-acumin">User</TableHead>
          <TableHead className="text-black text-xs font-semibold font-acumin">Email</TableHead>
          <TableHead className="text-black text-xs font-semibold font-acumin">Role</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user, index) => (
          <TableRow key={user.user} className={index === 1 ? 'bg-neutral-100' : ''}>
            <TableCell className="font-medium flex flex-col sm:flex-row items-center gap-x-2">
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
    </Table>
  );
}
