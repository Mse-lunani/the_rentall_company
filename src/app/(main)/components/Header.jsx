"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleGetStartedClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      <header
        id="header"
        className="header d-flex align-items-center sticky-top"
      >
        <div className="container-fluid container-xl position-relative d-flex align-items-center">
          <Link href="/" className="logo d-flex align-items-center me-auto">
            <Image
              src="/assets/img/logo.png"
              alt="Rentall Logo"
              width={150}
              height={50}
            />
          </Link>

          <nav id="navmenu" className="navmenu">
            <ul>
              <li>
                <Link href="#hero" className="active">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about">About</Link>
              </li>
              <li>
                <Link href="#about2">What We Do</Link>
              </li>
              <li>
                <Link href="#clients">Clients</Link>
              </li>
              <li>
                <Link href="#contact">Contact</Link>
              </li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>

          <button
            className="btn-getstarted"
            onClick={handleGetStartedClick}
            style={{ border: "none", cursor: "pointer" }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Login Selection Modal */}
      {showLoginModal && (
        <>
          <div className="modal-backdrop-custom" onClick={handleCloseModal}>
            <div
              className="modal-dialog-custom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content-custom">
                <div className="modal-header-custom">
                  <div>
                    <h5 className="modal-title-custom">Welcome Back!</h5>
                    <p className="modal-subtitle-custom">
                      Choose your account type to continue
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-close-custom"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body-custom">
                  <Link
                    href="/login"
                    className="login-option login-option-admin"
                    onClick={handleCloseModal}
                  >
                    <div className="login-text">
                      <h6 className="login-title">Admin Login</h6>
                      <p className="login-description">
                        System administration and management
                      </p>
                    </div>
                    <span className="login-arrow">→</span>
                  </Link>

                  <Link
                    href="/owner-login"
                    className="login-option login-option-owner"
                    onClick={handleCloseModal}
                  >
                    <div className="login-text">
                      <h6 className="login-title">Property Owner</h6>
                      <p className="login-description">
                        Manage your properties and tenants
                      </p>
                    </div>
                    <span className="login-arrow">→</span>
                  </Link>

                  <Link
                    href="/tenant_login"
                    className="login-option login-option-tenant"
                    onClick={handleCloseModal}
                  >
                    <div className="login-text">
                      <h6 className="login-title">Tenant Login</h6>
                      <p className="login-description">
                        Access your rental dashboard
                      </p>
                    </div>
                    <span className="login-arrow">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
