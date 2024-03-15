import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default class CustomDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link
                        rel="stylesheet"
                        href="https://use.typekit.net/ckz5ous.css"
                    />
                    <Script
                        strategy="afterInteractive"
                        id="show-banner"
                        dangerouslySetInnerHTML={{
                            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NPWKXNB5');`,
                        }}
                    />
                    <Script
                        strategy="afterInteractive"
                        id="hotjar"
                        dangerouslySetInnerHTML={{
                            __html: `(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:3904211,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
`,
                        }}
                    />
                </Head>
                <body className="font-acumin">
                    <noscript
                        dangerouslySetInnerHTML={{
                            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NPWKXNB5"
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
