// src/app/dashboard/components/Footer.jsx
import React from "react";
import Script from "next/script";

export default function Footer() {
  return (
    <>
      {/* ── Page Footer ────────────────────────────────────────────────── */}
      <footer className="content-footer footer bg-footer-theme">
        <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
          <div className="mb-2 mb-md-0">
            © {new Date().getFullYear()}{" "}
            <a
              href="https://rentall.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link fw-bolder"
            >
              The Rentall Company
            </a>
          </div>
          <div>
            <a
              href="https://rentall.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link me-4"
            >
              Documentation
            </a>
          </div>
        </div>
      </footer>

      {/* ── Core JS (Bottom of Body) ───────────────────────────────────── */}
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
        src="/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js"
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

      {/* ── Vendors JS ─────────────────────────────────────────────────── */}
      <Script
        src="/assets/vendor/libs/apex-charts/apexcharts.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/libs/toastr/toastr.js"
        strategy="afterInteractive"
      />

      {/* ── Main JS ─────────────────────────────────────────────────────── */}
      <Script src="/assets/js/main.js" strategy="afterInteractive" />

      {/* ── Page-Specific JS ───────────────────────────────────────────── */}
      <Script src="/assets/js/dashboards-crm.js" strategy="afterInteractive" />
      <Script src="/assets/js/mytable.js" strategy="afterInteractive" />
    </>
  );
}
