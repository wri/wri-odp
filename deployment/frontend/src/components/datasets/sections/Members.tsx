import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/_shared/Table'
import { RouterOutput } from '@/server/api/root'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { PencilIcon } from '@heroicons/react/24/outline'

type DatasetMembers = RouterOutput['dataset']['getDatasetCollaborators']

export function Members({ members }: { members: DatasetMembers }) {
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
                    {members.map((user, index) => (
                        <TableRow
                            key={user.user_id}
                            className={index === 1 ? 'bg-neutral-100' : ''}
                        >
                            <TableCell className="flex flex-col items-center gap-x-2 font-medium sm:flex-row">
                                <div className="relative h-6 w-6 rounded-full bg-zinc-300">
                                    <img
                                        className="absolute inset-0 h-full w-full object-cover rounded-full"
                                        src={
                                            user.image_display_url !== ''
                                                ? user.image_display_url
                                                : user.gravatar_url ??
                                                  '/images/placeholders/user/userdefault.png'
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
                            <TableCell className="flex justify-end">
                                <PencilIcon className="mr-4 h-5 w-5 text-black" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>{' '}
            <button className="ml-auto mt-4 flex items-center justify-end gap-x-1">
                <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
                    Add another collaborator
                </span>
            </button>
        </>
    )
}
