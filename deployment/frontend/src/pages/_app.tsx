import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'
import { useState } from 'react'

import 'react-toastify/dist/ReactToastify.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import localFont from 'next/font/local'

import { api } from '@/utils/api'

import '@/styles/globals.scss'
import '@/styles/rte.css'
import ReactToastContainer from '@/components/_shared/ReactToastContainer'
import { DefaultSeo } from 'next-seo'

const acumin = localFont({
    src: [
        {
            path: './fonts/acumin-pro-semi-condensed.otf',
            weight: '400',
            style: 'normal',
        },
        {
            path: './fonts/acumin-pro-semi-condensed-light.otf',
            weight: '300',
            style: 'light',
        },
        {
            path: './fonts/acumin-pro-semi-condensed-smbd.otf',
            weight: '600',
            style: 'semibold',
        },
        {
            path: './fonts/acumin-pro-semi-condensed-bold.otf',
            weight: '700',
            style: 'bold',
        },
    ],
    variable: '--font-acumin',
})
const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    const [queryClient] = useState(() => new QueryClient())
    return (
        <QueryClientProvider client={queryClient}>
            <DefaultSeo titleTemplate="%s - WRI ODP" />
            <Hydrate
                /* @ts-ignore */
                state={pageProps.dehydratedState}
            >
                <SessionProvider session={session}>
                    <ReactToastContainer />
                    <main className={`${acumin.variable} font-sans`}>
                        <Component {...pageProps} />
                    </main>
                </SessionProvider>
            </Hydrate>
        </QueryClientProvider>
    )
}

export default api.withTRPC(MyApp)
