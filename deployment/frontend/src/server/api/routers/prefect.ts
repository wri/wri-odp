import { env } from '@/env.mjs'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { CkanResponse } from '@/schema/ckan.schema'

export interface Log {
    id: string
    created: string
    updated?: string
    name: string
    level: number
    message?: string
    timestamp: string
    flow_run_id: string
    task_run_id: string | null
}

interface Task {
    id: string
    entity_id: string
    entity_type: string
    task_type: string
    key: string
    value: string
    state: string
    error: string
    last_updated: string
}

interface FlowState {
    id: string
    type: string
    name: string
    timestamp: string
    message: string
    logs: Log[]
}

export const prefectRouter = createTRPCRouter({
    submitToDatapusher: protectedProcedure
        .input(z.object({ resourceId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            console.log(`Submitting ${input.resourceId} to Datapusher`)
            const user = ctx.session.user
            const submitToDatapusherRes = await fetch(
                `${env.CKAN_URL}/api/action/prefect_datapusher_submit`,
                {
                    headers: {
                        'content-type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                    body: JSON.stringify({
                        resource_id: input.resourceId,
                        force: true,
                    }),
                    method: 'POST',
                }
            )
            const submitToDatapusher: CkanResponse<boolean> =
                await submitToDatapusherRes.json()
            console.log('submitToDatapusher', submitToDatapusher)
            return submitToDatapusher
        }),
    getFlowState: protectedProcedure
        .input(z.object({ resourceId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const taskRes = await fetch(
                    `${env.CKAN_URL}/api/action/prefect_latest_task?resource_id=${input.resourceId}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                    }
                )
                const tasks: CkanResponse<Task> = await taskRes.json()
                const flow_id = JSON.parse(tasks.result.value).job_id
                if (!flow_id) return null
                const body = {
                    limit: 200,
                    logs: {
                        level: { ge_: 0 },
                        flow_run_id: {
                            any_: [flow_id],
                        },
                    },
                    flow_run_id: { any_: [flow_id] },
                    offset: 0,
                    sort: 'TIMESTAMP_ASC',
                }
                const flowStateRes = await fetch(
                    `${env.PREFECT_INTERNAL_URL}/api/flow_runs/${flow_id}`,
                    {
                        headers: {
                            'content-type': 'application/json',
                        },
                    }
                )
                const flowState = await flowStateRes.json()
                const logsRes = await fetch(
                    `${env.PREFECT_INTERNAL_URL}/api/logs/filter`,
                    {
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify(body),
                        method: 'POST',
                    }
                )
                const logs: Log[] = await logsRes.json()
                return { ...flowState.state, logs }
            } catch (e) {
                console.log(e)
                throw e
            }
        }),
})
