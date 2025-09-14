"use client"; // only if you plan to add client‐side interactivity (e.g. reading query‐params)

import { useEffect, useState } from "react";
import Script from "next/script";

export default function LoginPage() {
  // If you want to show an error message based on ?error=… in the URL, you can do:
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // check URL query for error (e.g. ?error=1)
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setHasError(true);
    }
  }, []);

  return (
    <>
      <div className="container-xxl">
        <div className="authentication-wrapper authentication-basic container-p-y">
          <div className="authentication-inner">
            <div className="card">
              <div className="card-body">
                {/* Logo */}
                <div className="app-brand justify-content-center">
                  <a href="#" className="app-brand-link gap-2">
                    <img
                      alt="Logo"
                      src="/assets/img/logo.png"
                      style={{ width: 150 }}
                    />
                  </a>
                </div>
                {/* /Logo */}

                <div className="text-center mb-3">
                  <span className="badge bg-primary fs-6 px-3 py-2">Admin Portal</span>
                </div>
                <h4 className="mb-2">Welcome to The Rentall Company 👋</h4>
                <p className="mb-4">
                  Admin login - Please sign-in to your admin account
                </p>

                <form
                  id="formAuthentication"
                  className="mb-3"
                  action="/api/login"
                  method="POST"
                >
                  {hasError && (
                    <div className="mb-3">
                      <span className="p-3 text-danger">
                        Wrong email or password
                      </span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      autoFocus
                    />
                  </div>

                  <div className="mb-3 form-password-toggle">
                    <div className="d-flex justify-content-between">
                      <label className="form-label" htmlFor="password">
                        Password
                      </label>
                      <a href="#">
                        <small>Forgot Password?</small>
                      </a>
                    </div>
                    <div className="input-group input-group-merge">
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        name="password"
                        placeholder="••••••••••••"
                        aria-describedby="password"
                      />
                      <span className="input-group-text cursor-pointer">
                        <i className="bx bx-hide"></i>
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="remember-me"
                      />
                      <label className="form-check-label" htmlFor="remember-me">
                        {" "}
                        Remember Me{" "}
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <button
                      className="btn btn-primary d-grid w-100"
                      type="submit"
                    >
                      Sign in
                    </button>
                  </div>
                </form>

                <div className="text-center mt-3">
                  <p className="text-muted">
                    Are you a property owner?{" "}
                    <a href="/owner-login" className="text-primary">
                      Login as Owner
                    </a>
                  </p>
                </div>
              </div>
            </div>
            {/* /Register */}
          </div>
        </div>
      </div>
    </>
  );
}
