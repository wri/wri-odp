import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'
import { useState } from 'react'
import { Provider, useCreateStore } from '@/utils/store'
import { type LayerState } from '@/interfaces/state.interface'
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
    const newLayersState = new Map()
    if (
        //@ts-ignore
        pageProps.initialZustandState &&
        //@ts-ignore
        pageProps.initialZustandState.layersParsed
    ) {
        //@ts-ignore
        pageProps.initialZustandState.layersParsed?.forEach(
            (layer: [string, LayerState]) => {
                newLayersState.set(layer[0], layer[1])
            }
        )
    }
    const createStore = useCreateStore({
        //@ts-ignore
        ...pageProps.initialZustandState,
        layers: newLayersState,
    })
    const [queryClient] = useState(() => new QueryClient())
    return (
        <QueryClientProvider client={queryClient}>
            <DefaultSeo titleTemplate="%s - WRI ODP" />
            <Hydrate
                /* @ts-ignore */
                state={pageProps.dehydratedState}
            >
                <Provider createStore={createStore}>
                    <SessionProvider session={session}>
                        <ReactToastContainer />
                        <main className={`${acumin.variable} font-sans`}>
                            <Component {...pageProps} />
                        </main>
                    </SessionProvider>
                </Provider>
            </Hydrate>
        </QueryClientProvider>
    )
}

export default api.withTRPC(MyApp)
