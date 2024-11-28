import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'
import { env } from '@/env.mjs'

export default class CustomDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <script dangerouslySetInnerHTML={{
                      __html: `
                      window.dataLayer = window.dataLayer ||[];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('consent','default',{
                        'ad_storage':'denied',
                        'analytics_storage':'denied',
                        'ad_user_data':'denied',
                        'ad_personalization':'denied',
                        'personalization_storage':'denied',
                        'functionality_storage':'granted',
                        'security_storage':'granted',
                        'wait_for_update': 500
                      });
                      gtag("set", "ads_data_redaction", true);
                      // Reloads page after Osano consent is saved
                      // Needed so that the Google Tag Manager and Hotjar checks can run again
                      const osanoCheckInterval = setInterval(function() {
                          const saveButton = document.querySelector('.osano-cm-save');
                          if (saveButton) {
                              saveButton.addEventListener('click', function() {
                                  window.location.reload();
                              });
                              clearInterval(osanoCheckInterval);
                          }
                      }, 500);
                      `
                    }} />
                    <script src={ env.OSANO_URL }></script>
                    <link
                        rel="stylesheet"
                        href="https://use.typekit.net/ckz5ous.css"
                    />
                    {
                        env.NEXT_PUBLIC_DISABLE_HOTJAR === "disabled" ? "" :
                                 <Script
                        strategy="afterInteractive"
                        id="show-banner"
                        dangerouslySetInnerHTML={{
                            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${env.NEXT_PUBLIC_GTM_ID}');`,
                        }}
                                />
                    }
                    {
                        env.NEXT_PUBLIC_DISABLE_HOTJAR === "disabled" ? "" :
                                <Script
                        strategy="afterInteractive"
                        id="hotjar"
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(){
                                    function loadHotjar() {
                                        // Disables Hotjar if user has denied analytics consent
                                        var consent = Osano.cm.getConsent();
                                        if (consent.ANALYTICS !== 'DENY') {
                                            (function(h,o,t,j,a,r){
                                                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                                                h._hjSettings={hjid:${env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                                                a=o.getElementsByTagName('head')[0];
                                                r=o.createElement('script');r.async=1;
                                                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                                                a.appendChild(r);
                                            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                                        }
                                    }
                                    if (document.readyState === 'complete') {
                                        loadHotjar();
                                    } else {
                                        window.addEventListener('load', loadHotjar);
                                    }
                                })();
                                `,
                        }}
                    />
                    }
                    <meta name="msvalidate.01" content="8951A137F58082BF155A0C8F03C9B207" />
                </Head>
                <body className="font-acumin">
                    <noscript
                        dangerouslySetInnerHTML={{
                            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${env.NEXT_PUBLIC_GTM_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
                        }}
                    />
                    <Main />
                </body>
                <NextScript />
            </Html>
        )
    }
}
