// src/app/dashboard/components/Navbar.jsx
"use client";
import React, { useState, useEffect } from "react";

function toggleSidebar() {
  console.log('Hamburger clicked!'); // Debug log
  const layoutContainer = document.querySelector('.layout-container');
  
  if (layoutContainer) {
    layoutContainer.classList.toggle('layout-menu-expanded');
    console.log('Current classes:', layoutContainer.className); // Debug log
  }
}

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.dropdown-shortcuts');
      
      if (isDropdownOpen && dropdown && !dropdown.contains(event.target)) {
        console.log('Clicked outside dropdown, closing');
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav
      className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
      id="layout-navbar"
    >
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <button className="nav-item nav-link px-0 me-xl-4 btn btn-link" onClick={toggleSidebar} style={{border: 'none', background: 'none'}}>
          <i className="bx bx-menu bx-sm" />
        </button>
      </div>

      <div
        className="navbar-nav-right d-flex align-items-center"
        id="navbar-collapse"
      >
        {/* Search */}
        <div className="navbar-nav align-items-center">
          <div className="nav-item navbar-search-wrapper mb-0">
            <button
              className="nav-item nav-link search-toggler px-0 btn btn-link"
              style={{border: 'none', background: 'none'}}
            >
              <i className="bx bx-search bx-sm" />
              <span className="d-none d-md-inline-block text-muted">
                Search (Ctrl+/)
              </span>
            </button>
          </div>
        </div>
        {/* /Search */}

        <ul className="navbar-nav flex-row align-items-center ms-auto">
          {/* Style Switcher */}
          <li className="nav-item me-2 me-xl-0">
            <button
              className="nav-link style-switcher-toggle hide-arrow btn btn-link"
              style={{border: 'none', background: 'none'}}
              onClick={() => {/* Add style switcher logic if needed */}}
            >
              <i className="bx bx-sm" />
            </button>
          </li>
          {/*/ Style Switcher */}

          {/* Quick links */}
          <li className="nav-item dropdown-shortcuts navbar-dropdown dropdown me-2 me-xl-0">
            <button
              className="nav-link dropdown-toggle hide-arrow btn btn-link"
              style={{border: 'none', background: 'none'}}
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
            >
              <i className="bx bx-grid-alt bx-sm" />
            </button>
            <div className={`dropdown-menu py-0 ${isDropdownOpen ? 'show' : ''}`} style={{right: '0', left: 'auto'}}>
              <div className="dropdown-menu-header border-bottom">
                <div className="dropdown-header d-flex align-items-center py-3">
                  <h5 className="text-body mb-0 me-auto">Shortcuts</h5>
                  <button
                    className="dropdown-shortcuts-add text-body btn btn-link p-0"
                    style={{border: 'none', background: 'none'}}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Add shortcuts"
                  >
                    <i className="bx bx-sm bx-plus-circle" />
                  </button>
                </div>
              </div>
              <div className="dropdown-shortcuts-list scrollable-container">
                <div className="row row-bordered overflow-visible g-0">
                  <div className="dropdown-shortcuts-item col">
                    <span className="dropdown-shortcuts-icon bg-label-secondary rounded-circle mb-2">
                      <i className="bx bx-folder fs-4" />
                    </span>
                    <a href="/tenant_dashboard" className="stretched-link">
                      Dashboard
                    </a>
                    <small className="text-muted mb-0">My Home</small>
                  </div>
                  <div className="dropdown-shortcuts-item col">
                    <span className="dropdown-shortcuts-icon bg-label-secondary rounded-circle mb-2">
                      <i className="bx bx-money fs-4" />
                    </span>
                    <a href="/tenant_dashboard/payments" className="stretched-link">
                      My Payments
                    </a>
                    <small className="text-muted mb-0">Payment History</small>
                  </div>
                </div>
                <div className="row row-bordered overflow-visible g-0">
                  <div className="dropdown-shortcuts-item col">
                    <span className="dropdown-shortcuts-icon bg-label-secondary rounded-circle mb-2">
                      <i className="bx bx-user-circle fs-4" />
                    </span>
                    <a href="/tenant_dashboard/profile" className="stretched-link">
                      My Profile
                    </a>
                    <small className="text-muted mb-0">Account Settings</small>
                  </div>
                  <div className="dropdown-shortcuts-item col">
                    <span className="dropdown-shortcuts-icon bg-label-secondary rounded-circle mb-2">
                      <i className="bx bx-cog fs-4" />
                    </span>
                    <a href="/login" className="stretched-link">
                      Admin Portal
                    </a>
                    <small className="text-muted mb-0">Admin Access</small>
                  </div>
                </div>
              </div>
            </div>
          </li>
          {/* / Quick links */}
        </ul>
      </div>

      {/* Search Small Screens */}
      <div className="navbar-search-wrapper search-input-wrapper d-none">
        <input
          type="text"
          className="form-control search-input container-xxl border-0"
          placeholder="Search..."
          aria-label="Search..."
        />
        <i className="bx bx-x bx-sm search-toggler cursor-pointer" />
      </div>
    </nav>
  );
}
