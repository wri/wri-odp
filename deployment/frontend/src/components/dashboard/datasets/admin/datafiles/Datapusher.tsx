import { ScrollArea } from '@/components/_shared/ScrollArea'
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
    TableBody,
} from '@/components/_shared/Table'
import { ResourceFormType } from '@/schema/dataset.schema'
import { Log } from '@/server/api/routers/prefect'
import { api } from '@/utils/api'

function convertTimestamp(timestamp: string) {
    const date = new Date(timestamp)
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`
}

export function Datapusher({ datafile }: { datafile: ResourceFormType }) {
    const { isLoading, data: flowState } = api.prefect.getFlowState.useQuery(
        {
            resourceId: datafile.id ?? '',
        },
        {
            refetchInterval: (data) =>
                data && data.type === 'COMPLETED' ? false : 5000,
        }
    )
    return (
        <ScrollArea className="h-[30rem]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-neutral-50">
                        <TableHead className="w-[15rem] font-acumin text-xs font-semibold text-black">
                            Timestamp
                        </TableHead>
                        <TableHead className="font-acumin text-xs font-semibold text-black">
                            Message
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flowState &&
                        flowState.logs?.map((log: Log, index: number) => (
                            <TableRow
                                key={index}
                                className={
                                    index % 2 != 0
                                        ? 'border-0 bg-[#FDFDFD]'
                                        : 'border-0'
                                }
                            >
                                <TableCell>
                                    {convertTimestamp(log.timestamp)}
                                </TableCell>
                                <TableCell>{log.message}</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </ScrollArea>
    )
}
