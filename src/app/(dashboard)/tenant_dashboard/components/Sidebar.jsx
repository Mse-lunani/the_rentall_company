"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function TenantSidebar() {
  const pathname = usePathname();

  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      <div className="app-brand demo">
        <Link href="/tenant_dashboard" className="app-brand-link">
          <img src="/assets/img/logo.png" style={{ width: 110 }} />
        </Link>
        <a
          href="javascript:void(0);"
          className="layout-menu-toggle menu-link text-large ms-auto"
        >
          <i className="bx bx-chevron-left bx-sm align-middle" />
        </a>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        {/* Dashboard */}
        <li
          className={`menu-item ${pathname === "/tenant_dashboard" ? "active" : ""}`}
        >
          <Link href="/tenant_dashboard" className="menu-link">
            <i className="menu-icon tf-icons bx bx-home-circle" />
            <div data-i18n="Dashboard">Dashboard</div>
          </Link>
        </li>

        {/* Payments */}
        <li
          className={`menu-item ${
            pathname === "/tenant_dashboard/payments" ? "active" : ""
          }`}
        >
          <Link href="/tenant_dashboard/payments" className="menu-link">
            <i className="menu-icon tf-icons bx bx-money" />
            <div data-i18n="Payments">My Payments</div>
          </Link>
        </li>

        {/* Profile */}
        <li
          className={`menu-item ${
            pathname === "/tenant_dashboard/profile" ? "active" : ""
          }`}
        >
          <Link href="/tenant_dashboard/profile" className="menu-link">
            <i className="menu-icon tf-icons bx bx-user-circle" />
            <div data-i18n="Profile">Profile</div>
          </Link>
        </li>

        {/* Logout */}
        <li className={`menu-item`}>
          <Link href="/api/auth/tenant/logout" className="menu-link">
            <i className="menu-icon tf-icons bx bx-log-out" />
            <div data-i18n="logout">Logout</div>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
