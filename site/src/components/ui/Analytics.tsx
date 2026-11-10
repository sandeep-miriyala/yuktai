import Script from "next/script";

// Google Analytics (page views only), as on the earlier site.
const ID = "G-RFVRJ0S1DZ";

export default function Analytics() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ID}`} strategy="afterInteractive" />
      <Script id="ga" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${ID}');`}
      </Script>
    </>
  );
}
