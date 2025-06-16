import Script from "next/script";

export default function LoginScripts() {
  return (
    <>
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
    </>
  );
}
