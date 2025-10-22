import Script from "next/script";
import Head from "next/head";

// This layout applies ONLY to routes under “/login” (and any other “auth” sub-pages).
// Because it itself renders <html><head><body>…, it “hides” whatever (main)/layout.jsx would have done.

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>Rentall Portal</title>
        <meta name="description" content="KenyanNurse Login Portal" />
        <link rel="icon" href="/assets/img/favicon.png" />

        {/* ─── Fonts ─────────────────────────────────────────────── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />

        {/* ─── Core CSS (Login-specific) ──────────────────────────── */}
        <link rel="stylesheet" href="/assets/vendor/css/rtl/core.css" />
        <link
          rel="stylesheet"
          href="/assets/vendor/css/rtl/theme-default.css"
        />
        <link rel="stylesheet" href="/assets/css/demo.css" />

        {/* ─── Vendor CSS ─────────────────────────────────────────── */}
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/typeahead-js/typeahead.css"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/formvalidation/dist/css/formValidation.min.css"
        />

        {/* ─── Page-Specific CSS ──────────────────────────────────── */}
        <link rel="stylesheet" href="/assets/vendor/css/pages/page-auth.css" />
      </head>

      <body className="login-body">
        {children}

        {/* ─── Login-Specific Scripts ─────────────────────────────── */}
        <Script
          src="/assets/vendor/libs/jquery/jquery.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/vendor/libs/popper/popper.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/vendor/js/bootstrap.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/vendor/libs/hammer/hammer.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/vendor/libs/i18n/i18n.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/vendor/libs/typeahead-js/typeahead.js"
          strategy="afterInteractive"
        />
        <Script src="/assets/vendor/js/menu.js" strategy="afterInteractive" />
        <Script
          src="/assets/vendor/libs/formvalidation/dist/js/FormValidation.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/vendor/libs/formvalidation/dist/js/plugins/Bootstrap5.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/vendor/libs/formvalidation/dist/js/plugins/AutoFocus.min.js"
          strategy="afterInteractive"
        />
        <Script src="/assets/js/main-admin.js" strategy="afterInteractive" />
        <Script src="/assets/js/pages-auth.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
