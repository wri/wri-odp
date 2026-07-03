import { type TRPCError } from '@trpc/server';
import type { ProcedureType } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { ZodError } from 'zod';

import type { createTRPCContext } from '@/server/api/trpc';

type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;

type TrpcErrorLogPayload = {
    error: TRPCError;
    path: string | undefined;
    type: ProcedureType | 'unknown';
    input: unknown;
    ctx: TrpcContext | undefined;
};

const SENSITIVE_KEY_PATTERN =
    /api[-_]?key|password|token|secret|authorization|credential/i;

const MAX_STRING_LENGTH = 1_000;
const MAX_STACK_LENGTH = 4_000;
const MAX_SANITIZE_DEPTH = 6;
const MAX_CAUSE_CHAIN = 5;

function truncate(value: string, max: number): string {
    return value.length > max
        ? `${value.slice(0, max)}... [truncated ${value.length - max} chars]`
        : value;
}

function sanitizeInput(input: unknown, depth = 0): unknown {
    if (input === null || input === undefined) {
        return input;
    }

    if (typeof input === 'string') {
        return truncate(input, MAX_STRING_LENGTH);
    }

    if (typeof input !== 'object') {
        return input;
    }

    if (depth >= MAX_SANITIZE_DEPTH) {
        return '[max depth exceeded]';
    }

    if (Array.isArray(input)) {
        return input.map((item) => sanitizeInput(item, depth + 1));
    }

    return Object.fromEntries(
        Object.entries(input as Record<string, unknown>).map(
            ([key, value]) => [
                key,
                SENSITIVE_KEY_PATTERN.test(key)
                    ? '[REDACTED]'
                    : sanitizeInput(value, depth + 1),
            ]
        )
    );
}

/**
 * tRPC wraps thrown errors (e.g. `throw Error('...')` after a failed CKAN
 * call) in a TRPCError, so the original error lives in the `cause` chain.
 */
function serializeCauseChain(
    error: unknown
): Array<{ name: string; message: string }> {
    const chain: Array<{ name: string; message: string }> = [];
    let current: unknown = error;

    while (current instanceof Error && chain.length < MAX_CAUSE_CHAIN) {
        chain.push({
            name: current.name,
            message: truncate(current.message, MAX_STRING_LENGTH),
        });
        current = current.cause;
    }

    return chain;
}

/** Deepest stack in the cause chain points at the original failure site. */
function deepestStack(error: Error): string | undefined {
    let stack = error.stack;
    let current: unknown = error.cause;
    let hops = 0;

    while (current instanceof Error && hops < MAX_CAUSE_CHAIN) {
        if (current.stack) stack = current.stack;
        current = current.cause;
        hops += 1;
    }

    return stack;
}

function safeStringify(payload: Record<string, unknown>): string {
    const seen = new WeakSet<object>();
    try {
        return JSON.stringify(payload, (_key, value: unknown) => {
            if (typeof value === 'bigint') return value.toString();
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) return '[circular]';
                seen.add(value);
            }
            return value;
        });
    } catch {
        return JSON.stringify({
            type: 'trpc_error',
            level: 'error',
            message: 'Failed to serialize tRPC error payload',
            path: payload.path ?? null,
            code: payload.code ?? null,
        });
    }
}

export function logTrpcError({
    error,
    path,
    type,
    input,
    ctx,
}: TrpcErrorLogPayload) {
    // Expected when sessions expire; logging these would only add noise
    if (error.code === 'UNAUTHORIZED') {
        return;
    }

    const payload: Record<string, unknown> = {
        type: 'trpc_error',
        level: 'error',
        timestamp: new Date().toISOString(),
        path: path ?? null,
        procedureType: type,
        code: error.code,
        message: truncate(error.message, MAX_STRING_LENGTH),
        httpStatus: getHTTPStatusCodeFromError(error),
        user: ctx?.session?.user?.username ?? ctx?.session?.user?.id ?? null,
        sysadmin: ctx?.session?.user?.sysadmin ?? null,
        ip: ctx?.ip ?? null,
        input: sanitizeInput(input),
    };

    const causeChain = serializeCauseChain(error.cause);
    if (causeChain.length > 0) {
        payload.cause = causeChain;
    }

    if (error.cause instanceof ZodError) {
        payload.zodError = error.cause.flatten();
    }

    if (error.code === 'INTERNAL_SERVER_ERROR') {
        const stack = deepestStack(error);
        if (stack) {
            payload.stack = truncate(stack, MAX_STACK_LENGTH);
        }
    }

    console.error(safeStringify(payload));
}
