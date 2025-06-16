"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      <div className="app-brand demo">
        <Link href="/dashboard" className="app-brand-link">
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
        <li
          className={`menu-item ${pathname === "/dashboard" ? "active" : ""}`}
        >
          <Link href="/dashboard" className="menu-link">
            <i className="menu-icon tf-icons bx bx-home-circle" />
            <div data-i18n="Dashboard">Dashboard</div>
          </Link>
        </li>

        <li
          className="menu-item menu-toggle"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        >
          <a href="javascript:void(0);" className="menu-link">
            <i className="menu-icon tf-icons bx bx-folder" />
            <div data-i18n="Buildings">Buildings</div>
          </a>

          <ul className={`menu-sub ${isDropdownOpen ? "d-block" : "d-none"}`}>
            <li
              className={`menu-item ${
                pathname === "/dashboard/property_entry" ? "active" : ""
              }`}
            >
              <Link href="/dashboard/property_entry" className="menu-link">
                <div data-i18n="Create">Create Building</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                pathname === "/dashboard/property_records" ? "active" : ""
              }`}
            >
              <Link href="/dashboard/property_records" className="menu-link">
                <div data-i18n="View">View Buildings</div>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  );
}
