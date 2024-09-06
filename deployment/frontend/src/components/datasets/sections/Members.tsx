import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/_shared/Table'
import { RouterOutput } from '@/server/api/root'
import Image from 'next/image'

type DatasetMembers = RouterOutput['dataset']['getDatasetCollaborators']

export function Members({ members }: { members: DatasetMembers }) {
    return (
        <>
            {members.length === 0 ? (
                <div className="flex flex-col gap-y-4">
                    <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
                        No collaborators yet
                    </span>
                    <span className="font-['Acumin Pro SemiCondensed'] text-sm font-normal leading-tight text-black">
                        Add collaborators to help you manage this dataset
                    </span>
                </div>
            ) : (
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((user, index) => (
                            <TableRow
                                key={user.user_id}
                                className={index === 1 ? 'bg-neutral-100' : ''}
                            >
                                <TableCell className="flex flex-col items-center gap-x-2 font-medium sm:flex-row">
                                    <div className="relative h-6 w-6 rounded-full bg-zinc-300">
                                        <Image
                                            fill
                                            className="absolute inset-0 h-full w-full object-cover rounded-full"
                                            src={
                                                (user?.image_display_url as string)
                                                    ? user?.image_display_url
                                                    : `https://gravatar.com/avatar/${user?.email_hash}?s=270&d=identicon`
                                            }
                                            alt=""
                                        />
                                    </div>
                                    {user.display_name ??
                                        user.fullname ??
                                        user.name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="capitalize">
                                    {user.capacity}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}{' '}
        </>
    )
}
