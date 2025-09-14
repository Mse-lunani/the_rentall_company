"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isBuildingsOpen, setBuildingsOpen] = useState(false);
  const [isUnitsOpen, setUnitsOpen] = useState(false);
  const [isTenantsOpen, setTenantsOpen] = useState(false);
  const [isPaymentsOpen, setPaymentsOpen] = useState(false);
  const [isMaintenanceOpen, setMaintenanceOpen] = useState(false);

  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      <div className="app-brand demo">
        <Link href="/owner_dashboard" className="app-brand-link">
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
          className={`menu-item ${pathname === "/owner_dashboard" ? "active" : ""}`}
        >
          <Link href="/owner_dashboard" className="menu-link">
            <i className="menu-icon tf-icons bx bx-home-circle" />
            <div data-i18n="Dashboard">Dashboard</div>
          </Link>
        </li>

        {/* Buildings */}
        <li className="menu-item menu-toggle">
          <a
            href="javascript:void(0);"
            className="menu-link"
            onClick={() => setBuildingsOpen(!isBuildingsOpen)}
          >
            <i className="menu-icon tf-icons bx bx-folder" />
            <div data-i18n="Buildings">Buildings</div>
          </a>
          <ul className={`menu-sub ${isBuildingsOpen ? "d-block" : "d-none"}`}>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/property_entry" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/property_entry" className="menu-link">
                <div data-i18n="Create">Create Building</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/property_records" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/property_records" className="menu-link">
                <div data-i18n="View">View Buildings</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* Units */}
        <li className="menu-item menu-toggle">
          <a
            href="javascript:void(0);"
            className="menu-link"
            onClick={() => setUnitsOpen(!isUnitsOpen)}
          >
            <i className="menu-icon tf-icons bx bx-door-open" />
            <div data-i18n="Units">Units</div>
          </a>
          <ul className={`menu-sub ${isUnitsOpen ? "d-block" : "d-none"}`}>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/units" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/units" className="menu-link">
                <div data-i18n="All Units">All Units</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/units/standalone" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/units/standalone" className="menu-link">
                <div data-i18n="Standalone Units">Standalone Units</div>
              </Link>
            </li>
          </ul>
        </li>

        {/*  Tenants */}
        <li className="menu-item menu-toggle">
          <a
            href="javascript:void(0);"
            className="menu-link"
            onClick={() => setTenantsOpen(!isTenantsOpen)}
          >
            <i className="menu-icon tf-icons bx bx-user" />
            <div data-i18n="Tenants">Tenants</div>
          </a>
          <ul className={`menu-sub ${isTenantsOpen ? "d-block" : "d-none"}`}>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/tenants/add" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/tenants/add" className="menu-link">
                <div data-i18n="Add Tenant">Add Tenant</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/tenants" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/tenants" className="menu-link">
                <div data-i18n="View Tenants">View Tenants</div>
              </Link>
            </li>
          </ul>
        </li>

                {/* Payments */}
        <li className="menu-item menu-toggle">
          <a
            href="javascript:void(0);"
            className="menu-link"
            onClick={() => setPaymentsOpen(!isPaymentsOpen)}
          >
            <i className="menu-icon tf-icons bx bx-money" />
            <div data-i18n="Payments">Payments</div>
          </a>
          <ul className={`menu-sub ${isPaymentsOpen ? "d-block" : "d-none"}`}>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/payments/add" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/payments/add" className="menu-link">
                <div data-i18n="Add Payment">Add Payment</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/payments" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/payments" className="menu-link">
                <div data-i18n="View Payments">View Payments</div>
              </Link>
            </li>
          </ul>
        </li>
        {/* Maintenance */}
        <li className="menu-item menu-toggle">
          <a
            href="javascript:void(0);"
            className="menu-link"
            onClick={() => setMaintenanceOpen(!isMaintenanceOpen)}
          >
            <i className="menu-icon tf-icons bx bx-wrench" />
            <div data-i18n="Maintenance">Maintenance</div>
          </a>
          <ul
            className={`menu-sub ${isMaintenanceOpen ? "d-block" : "d-none"}`}
          >
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/maintenance/add" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/maintenance/add" className="menu-link">
                <div data-i18n="Add Maintenance">Add Maintenance</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                pathname === "/owner_dashboard/maintenance" ? "active" : ""
              }`}
            >
              <Link href="/owner_dashboard/maintenance" className="menu-link">
                <div data-i18n="View Maintenance">View Maintenance</div>
              </Link>
            </li>
          </ul>
        </li>
        {/* profile */}
        <li
          className={`menu-item ${
            pathname === "/owner_dashboard/profile" ? "active" : ""
          }`}
        >
          <Link href="/owner_dashboard/profile" className="menu-link">
            <i className="menu-icon tf-icons bx bx-user-circle" />
            <div data-i18n="Profile">Profile</div>
          </Link>
        </li>
        {/* logout */}
        <li className={`menu-item`}>
          <Link href="/api/auth/owner/logout" className="menu-link">
            <i className="menu-icon tf-icons bx bx-lock" />
            <div data-i18n="logout">Logout</div>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
