// ── src/app/(main)/layout.jsx ──

import "./globals.css";
import Script from "next/script";

export default function MainLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RENTALL</title>
        <link rel="icon" type="image/x-icon" href="/assets/img/favicon.png" />
        {/* ─── Global Scripts (jQuery & Bootstrap) ─────────────── */}
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="index-page">
        {children}

        {/* ─── Global “afterInteractive” Scripts ───────────────── */}
        <Script src="/assets/vendor/aos/aos.js" strategy="afterInteractive" />
        <Script
          src="/assets/vendor/swiper/swiper-bundle.min.js"
          strategy="afterInteractive"
        />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
