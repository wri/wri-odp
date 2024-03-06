import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { AppProps, type AppType } from 'next/app'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'
import { Provider, useCreateStore } from '@/utils/store'
import { useState, useEffect } from 'react'

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
import { LayerState } from '@/interfaces/state.interface'
import { env } from '@/env.mjs'
import NProgress from 'nprogress';
import Router from 'next/router';

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
}: AppProps) => {
    const [queryClient] = useState(() => new QueryClient())
    const { initialZustandState } = pageProps
    let { dataset, prevdataset } = pageProps

    useEffect(() => {
        const handleRouteStart = () => NProgress.start();
        const handleRouteDone = () => NProgress.done();

        Router.events.on('routeChangeStart', handleRouteStart);
        Router.events.on('routeChangeComplete', handleRouteDone);
        Router.events.on('routeChangeError', handleRouteDone);

        return () => {
            Router.events.off('routeChangeStart', handleRouteStart);
            Router.events.off('routeChangeComplete', handleRouteDone);
            Router.events.off('routeChangeError', handleRouteDone);
        };
    }, []);


    if (typeof prevdataset == 'string') {
        prevdataset = JSON.parse(prevdataset)
    }
    if (typeof dataset == 'string') {
        dataset = JSON.parse(dataset)
    }
    if (typeof initialZustandState?.dataset == 'string') {
        initialZustandState.dataset = JSON.parse(initialZustandState.dataset)
    }

    const newLayersState = new Map()
    if (initialZustandState && initialZustandState?.mapView?.layersParsed) {
        initialZustandState.mapView?.layersParsed?.forEach(
            (layer: [string, LayerState]) => {
                newLayersState.set(layer[0], layer[1])
            }
        )
    }

    let activeLayerGroups =
        initialZustandState?.mapView?.activeLayerGroups || []

    const layerAsLayerObj = new Map()
    const tempLayerAsLayerobj = new Map()

    if (!activeLayerGroups?.length && dataset) {
        const layers = dataset?.resources
            .filter((r: any) => r?.format == 'Layer')
            .map((r: any) => r?.rw_id)

        for (const resource of dataset?.resources) {
            if (resource.format == 'Layer') {
                if (
                    (resource['layerObj'] || resource['layerObjRaw']) &&
                    !resource.url
                ) {
                    layerAsLayerObj.set(resource.rw_id, 'pending')
                } else {
                    layerAsLayerObj.set(resource.rw_id, 'approved')
                }
            }
        }
    }

    if (initialZustandState && initialZustandState?.relatedDatasets.length) {
        const datasets = initialZustandState?.relatedDatasets
        for (const dataset of datasets) {
            for (const resource of dataset?.resources) {
                if (resource.format == 'Layer') {
                    if (
                        (resource['layerObj'] || resource['layerObjRaw']) &&
                        !resource.url
                    ) {
                        layerAsLayerObj.set(resource.rw_id, 'pending')
                    } else {
                        layerAsLayerObj.set(resource.rw_id, 'approved')
                    }
                }
            }
        }
    }

    if (
        initialZustandState &&
        initialZustandState?.prevRelatedDatasets.length
    ) {
        const datasets = initialZustandState?.prevRelatedDatasets
        for (const dataset of datasets) {
            for (const resource of dataset?.resources) {
                if (resource.format == 'Layer') {
                    if (
                        (resource['layerObj'] || resource['layerObjRaw']) &&
                        !resource.url
                    ) {
                        tempLayerAsLayerobj.set(resource.rw_id, 'pending')
                    } else {
                        tempLayerAsLayerobj.set(resource.rw_id, 'approved')
                    }
                }
            }
        }
    }

    if (prevdataset) {
        const layers = prevdataset?.resources
            .filter((r: any) => r?.format == 'Layer')
            .map((r: any) => r?.rw_id)

        for (const resource of prevdataset?.resources) {
            if (resource.format == 'Layer') {
                if (
                    resource['layerObj'] ||
                    (resource['layerObjRaw'] && !resource.url)
                ) {
                    tempLayerAsLayerobj.set(resource.rw_id, 'prevdataset')
                } else {
                    tempLayerAsLayerobj.set(resource.rw_id, 'approved')
                }
            }
        }
    }

    const createStore = useCreateStore({
        ...initialZustandState,
        layerAsLayerObj: layerAsLayerObj,
        tempLayerAsLayerobj: tempLayerAsLayerobj,
        mapView: {
            ...initialZustandState?.mapView,
            basemap: initialZustandState?.mapView?.basemap ?? 'dark',
            layers: newLayersState,
            activeLayerGroups,
        },
    })

    return (
        <QueryClientProvider client={queryClient}>
            <DefaultSeo
                titleTemplate="%s - WRI ODP"
                openGraph={{
                    images: [
                        {
                            url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/images/WRI_logo_4c.png`,
                            width: 800,
                            height: 600,
                            alt: 'Og Image Alt',
                        },
                    ],
                }}
                twitter={{
                    handle: '@WorldResources',
                    site: `${env.NEXT_PUBLIC_NEXTAUTH_URL}`,
                    cardType: 'summary_large_image',
                }}
            />
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
