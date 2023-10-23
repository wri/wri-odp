import Document, { Html, Head, Main, NextScript } from "next/document";

export default class CustomDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="stylesheet" href="https://use.typekit.net/ckz5ous.css" />
        </Head>
        <body className="font-acumin">
          <Main />
        </body>
        <NextScript />
      </Html>
    );
  }
}
