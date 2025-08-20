// src/app/dashboard/layout.jsx
"use client";
import React, { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Script from "next/script";
import Link from "next/link";

function closeSidebar() {
  const layoutContainer = document.querySelector('.layout-container');
  if (layoutContainer && layoutContainer.classList.contains('layout-menu-expanded')) {
    console.log('Closing sidebar');
    layoutContainer.classList.remove('layout-menu-expanded');
  }
}


export default function DashboardLayout({ children }) {
  useEffect(() => {
    function handleBodyClick(event) {
      const layoutContainer = document.querySelector('.layout-container');
      const sidebar = document.querySelector('.layout-menu');
      const hamburger = document.querySelector('.layout-menu-toggle');
      
      // Close sidebar if open and click is outside sidebar and hamburger
      if (layoutContainer?.classList.contains('layout-menu-expanded')) {
        if (!sidebar?.contains(event.target) && !hamburger?.contains(event.target)) {
          console.log('Body clicked outside sidebar');
          closeSidebar();
        }
      }
    }
    
    // Add event listener
    document.body.addEventListener('click', handleBodyClick);
    
    // Cleanup
    return () => {
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, []);

  return (
    <html
      lang="en"
      className="light-style layout-navbar-fixed layout-menu-fixed"
      dir="ltr"
      data-theme="theme-default"
      data-assets-path="/assets/"
      data-template="vertical-menu-template-starter"
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
        />
        <title>Rentall Portal</title>
        <meta name="description" content="" />

        {/* ── Favicon ─────────────────────────────────────────────────── */}
        <link
          rel="icon"
          type="image/x-icon"
          href="/assets/img/favicon/favicon.ico"
        />

        {/* ── Fonts ───────────────────────────────────────────────────── */}
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

        {/* ── Icons ───────────────────────────────────────────────────── */}
        <link rel="stylesheet" href="/assets/vendor/fonts/boxicons.css" />
        <link rel="stylesheet" href="/assets/vendor/fonts/fontawesome.css" />
        <link rel="stylesheet" href="/assets/vendor/fonts/flag-icons.css" />

        {/* ── Core CSS ────────────────────────────────────────────────── */}
        <link rel="stylesheet" href="/assets/vendor/css/rtl/core.css" />
        <link
          rel="stylesheet"
          href="/assets/vendor/css/rtl/theme-default.css"
        />
        <link rel="stylesheet" href="/assets/css/demo.css" />

        {/* ── Vendors CSS ─────────────────────────────────────────────── */}
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/typeahead-js/typeahead.css"
        />
        <link rel="stylesheet" href="/assets/vendor/libs/toastr/toastr.css" />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/animate-css/animate.css"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/apex-charts/apex-charts.css"
        />

        <link
          rel="stylesheet"
          href="/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/libs/datatables-rowgroup-bs5/rowgroup.bootstrap5.css"
        />
        <link rel="stylesheet" href="/assets/css/custom_css_dashboard.css" />

        {/* ── Helpers (JS that must live in <head>) ──────────────────── */}
        <script src="/assets/vendor/js/helpers.js"></script>
        <script src="/assets/js/config.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
      </head>

      <body>
        {/* ── OPEN: wrapper DIVs ─────────────────────────────────────── */}
        <div className="layout-wrapper layout-content-navbar">
          <div className="layout-container">
            {/* ── Sidebar (only the <aside>…) ────────────────────────── */}
            <Sidebar />

            {/* ── The rest of the “page” sits in here ─────────────────── */}
            <div className="layout-page">
              {/* ── Navbar (only the <nav>…) ───────────────────────── */}
              <Navbar />

              {/* ── This is where `page.jsx` (your content) renders ───────────────── */}
              {children}

              {/* ── Footer (only the <footer> + bottom‐of‐body scripts) ───────────── */}
              <Footer />
            </div>
          </div>
          
          {/* Keep overlay for visual effect */}
          <div className="layout-overlay"></div>
        </div>
        {/* ── CLOSE: wrapper DIVs ───────────────────────────────────────── */}

        {/* Drag target outside */}
        <div className="drag-target"></div>
      </body>
    </html>
  );
}
