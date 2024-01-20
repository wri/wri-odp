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
    getFlowState: protectedProcedure
        .input(z.object({ resourceId: z.string() }))
        .query(async ({ ctx, input }) => {
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
            console.log('FLOW ID', flow_id)
            const flowStateRes = await fetch(
                `http://127.0.0.1:4200/api/flow_runs/${flow_id}`,
                {
                    headers: {
                        'content-type': 'application/json',
                    },
                }
            )
            const flowState: FlowState = await flowStateRes.json()
            console.log('FLOW STATE', flowState)
            const logsRes = await fetch(
                'http://127.0.0.1:4200/api/logs/filter',
                {
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(body),
                    method: 'POST',
                }
            )
            const logs: Log[] = await logsRes.json()
            return { ...flowState, logs }
        }),
})
