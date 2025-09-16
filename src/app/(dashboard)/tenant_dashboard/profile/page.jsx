"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TenantProfilePage() {
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const res = await fetch(`/api/tenants_apis/tenancies`);
        const data = await res.json();

        if (res.ok) {
          setTenantData(data);
        } else {
          console.error("Failed to fetch tenant data:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch tenant data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  if (loading) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <div className="d-flex justify-content-center align-items-center" style={{height: "400px"}}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading your profile information...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <div className="text-center mt-5">
              <i className="bx bx-error-circle display-1 text-danger"></i>
              <h4>Unable to load your profile information</h4>
              <p className="text-muted">Please try refreshing the page or contact support if the issue persists.</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Refresh Page
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const { tenant, statistics } = tenantData;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>
                <i className="bx bx-user-circle me-2"></i>
                My Profile
              </h1>
              <p className="text-muted mb-0">View your personal information and account details</p>
            </div>
            <div>
              <Link href="/tenant_dashboard" className="btn btn-outline-primary">
                <i className="bx bx-arrow-back me-1"></i>
                Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="row">
            {/* Personal Information */}
            <div className="col-md-8">
              <div className="card mb-4">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="bx bx-user me-2"></i>
                    Personal Information
                  </h3>
                </div>
                <div className="card-body p-4">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Full Name</label>
                        <div className="form-control-plaintext border rounded p-2 bg-light">
                          <strong>{tenant.full_name}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Phone Number</label>
                        <div className="form-control-plaintext border rounded p-2 bg-light">
                          <strong>{tenant.phone}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Email Address</label>
                        <div className="form-control-plaintext border rounded p-2 bg-light">
                          {tenant.email || <span className="text-muted">Not provided</span>}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Account Created</label>
                        <div className="form-control-plaintext border rounded p-2 bg-light">
                          {new Date(tenant.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="alert alert-info">
                    <i className="bx bx-info-circle me-2"></i>
                    <strong>Need to update your information?</strong> Please contact your property manager or landlord to make changes to your profile.
                  </div>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="bx bx-chart-line me-2"></i>
                    Account Summary
                  </h3>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span className="text-muted">Total Tenancies</span>
                    <strong className="text-primary">{statistics.total_tenancies}</strong>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span className="text-muted">Active Tenancies</span>
                    <strong className="text-success">{statistics.active_tenancies}</strong>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span className="text-muted">Total Payments</span>
                    <strong className="text-info">KES {Number(statistics.total_payments_made).toLocaleString()}</strong>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Avg. Tenancy Duration</span>
                    <strong className="text-warning">{statistics.average_tenancy_duration} days</strong>
                  </div>
                </div>
              </div>

              {/* Current Active Tenancies */}
              {statistics.current_units && statistics.current_units.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="bx bx-home me-2"></i>
                      Current Units
                    </h3>
                  </div>
                  <div className="card-body p-4">
                    {statistics.current_units.map((unit, index) => (
                      <div key={index} className="bg-light-primary rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="text-success mb-1">
                              <i className="bx bx-door-open me-1"></i>
                              {unit.unit_name}
                            </h6>
                            <p className="text-muted mb-1 small">
                              {unit.building_name}
                            </p>
                            <p className="text-primary mb-0 small">
                              <strong>KES {Number(unit.monthly_rent).toLocaleString()}/month</strong>
                            </p>
                          </div>
                          <span className="badge bg-success">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}