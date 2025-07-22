// src/app/dashboard/components/Footer.jsx
import React from "react";

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
      <script src="/assets/vendor/libs/jquery/jquery.js"></script>
      <script src="/assets/vendor/libs/popper/popper.js"></script>
      <script src="/assets/vendor/js/bootstrap.js"></script>
      <script src="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>
      <script src="/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js"></script>
      <script src="/assets/vendor/libs/hammer/hammer.js"></script>
      <script src="/assets/vendor/libs/i18n/i18n.js"></script>
      <script src="/assets/vendor/libs/typeahead-js/typeahead.js"></script>
      <script src="/assets/vendor/js/menu.js"></script>

      {/* ── Vendors JS ─────────────────────────────────────────────────── */}
      <script src="/assets/vendor/libs/apex-charts/apexcharts.js"></script>
      <script src="/assets/vendor/libs/toastr/toastr.js"></script>

      {/* ── Main JS ─────────────────────────────────────────────────────── */}
      <script>
        {`
          document.addEventListener('DOMContentLoaded', function() {
            // Load main.js after DOM is ready
            const mainScript = document.createElement('script');
            mainScript.src = '/assets/js/main.js';
            document.body.appendChild(mainScript);
            
            // Load page-specific scripts
            const crmScript = document.createElement('script');
            crmScript.src = '/assets/js/dashboards-crm.js';
            document.body.appendChild(crmScript);
            
            const tableScript = document.createElement('script');
            tableScript.src = '/assets/js/mytable.js';
            document.body.appendChild(tableScript);
          });
        `}
      </script>
    </>
  );
}
