import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import localFont from "next/font/local";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import "@/styles/rte.css";

const acumin = localFont({
  src: [
    {
      path: "./fonts/acumin-pro-semi-condensed.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/acumin-pro-semi-condensed-light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "./fonts/acumin-pro-semi-condensed-smbd.otf",
      weight: "600",
      style: "semibold",
    },
    {
      path: "./fonts/acumin-pro-semi-condensed-bold.otf",
      weight: "700",
      style: "bold",
    },
  ],
  variable: "--font-acumin",
});
const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <main className={`${acumin.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
