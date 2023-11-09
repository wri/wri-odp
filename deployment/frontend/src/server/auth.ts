/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import { type GetServerSidePropsContext } from 'next'
import {
    getServerSession,
    type NextAuthOptions,
    type DefaultSession,
    User,
} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { env } from '@/env.mjs'
import ky from 'ky'
import type { CkanResponse } from '@/schema/ckan.schema'
import { Organization } from '@portaljs/ckan'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: DefaultSession['user'] & {
            id: string
            email: string
            username: string
            apikey: string
            teams: { name: string; id: string }[]
        }
    }

    interface User {
        email: string
        username: string
        apikey: string
        teams: { name: string; id: string }[]
    }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
    pages: {
        signIn: '/',
        signOut: '/',
        error: '/',
        verifyRequest: '/',
        newUser: '/',
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.apikey = user.apikey
                token.teams = user.teams
            }
            return token
        },
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    apikey: token.apikey ? token.apikey : '',
                    teams: token.teams ? token.teams : { name: '', id: '' },
                    id: token.sub,
                },
            }
        },
    },
    /*pages: {
    signIn: "/auth/signin",
  },*/
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: 'Credentials',
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: {
                    label: 'Username',
                    type: 'text',
                    placeholder: 'jsmith',
                },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, _req) {
                try {
                    console.log('Login credentials', credentials)
                    console.log('Ckan URL', env.CKAN_URL)
                    if (!credentials) return null
                    const userRes = await fetch(
                        `${env.CKAN_URL}/api/3/action/user_login`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                id: credentials.username,
                                password: credentials.password,
                            }),
                        }
                    )
                    const user: CkanResponse<
                        User & { frontend_token: string }
                    > = await userRes.json()

                    if ((user.result as any).errors) {
                        // TODO: error from the response should be sent to the client, but it's not working
                        throw new Error((user.result as any).error_summary.auth)
                    }

                    if (user.result.id) {
                        const orgListRes = await fetch(
                            `${env.CKAN_URL}/api/3/action/organization_list_for_user`,
                            {
                                method: 'POST',
                                body: JSON.stringify({ id: user.result.id }),
                                headers: {
                                    Authorization: user.result.frontend_token,
                                    'Content-Type': 'application/json',
                                },
                            }
                        )
                        const orgList: CkanResponse<Organization[]> =
                            await orgListRes.json()

                        console.log('Org list', orgList)
                        return {
                            ...user.result,
                            image: '',
                            apikey: user.result.frontend_token,
                            teams: orgList.result.map((org) => ({
                                name: org?.name ?? '',
                                id: org?.id ?? '',
                            })),
                        }
                    } else {
                        throw 'An unexpected error occurred while signing in. Please, try again.'
                    }
                } catch (e) {
                    console.log('Error', e)
                    throw e
                }
            },
        }),
    ],
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext['req']
    res: GetServerSidePropsContext['res']
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions)
}
