"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TenantDashboardPage() {
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
                <p className="mt-3">Loading your tenancy information...</p>
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
              <h4>Unable to load your information</h4>
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

  const { tenant, tenancy_history, statistics } = tenantData;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Welcome, {tenant.full_name}! 👋</h1>
              <p className="text-muted mb-0">Here's your complete tenancy information and history</p>
            </div>
            <div>
              <Link href="/tenant_dashboard/payments" className="btn btn-primary">
                <i className="bx bx-money me-1"></i>
                View Payments
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bx bx-home-alt display-4 text-primary mb-2"></i>
                  <h3 className="text-primary">{statistics.total_tenancies}</h3>
                  <p className="text-muted mb-0">Total Tenancies</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bx bx-check-circle display-4 text-success mb-2"></i>
                  <h3 className="text-success">{statistics.active_tenancies}</h3>
                  <p className="text-muted mb-0">Active Tenancies</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bx bx-money display-4 text-info mb-2"></i>
                  <h3 className="text-info">KES {Number(statistics.total_payments_made).toLocaleString()}</h3>
                  <p className="text-muted mb-0">Total Payments Made</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bx bx-calendar display-4 text-warning mb-2"></i>
                  <h3 className="text-warning">{statistics.average_tenancy_duration}</h3>
                  <p className="text-muted mb-0">Avg Days/Tenancy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Active Tenancies */}
          {statistics.current_units && statistics.current_units.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="bx bx-home me-2"></i>
                  Tenancies
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  {statistics.current_units.map((unit, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="bg-light-primary rounded p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="text-success mb-3">
                              <i className="bx bx-door-open me-2"></i>
                              {unit.unit_name}
                            </h5>
                            <p className="mb-0">
                              <strong>Building:</strong> {unit.building_name}<br/>
                              <strong>Monthly Rent:</strong> KES {Number(unit.monthly_rent).toLocaleString()}<br/>
                              <strong>Start Date:</strong> {new Date(unit.start_date).toLocaleDateString()}<br/>
                              <strong>Duration:</strong> {Math.floor((Date.now() - new Date(unit.start_date)) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                          <span className="badge bg-success">Active</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tenancy History Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="bx bx-history me-2"></i>
                Complete Tenancy History
              </h3>
            </div>
            <div className="card-body table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Building</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Monthly Rent</th>
                    <th>Status</th>
                    <th>Payments Made</th>
                  </tr>
                </thead>
                <tbody>
                  {tenancy_history.map((tenancy) => (
                    <tr key={tenancy.id}>
                      <td>
                        <strong>{tenancy.unit_name}</strong>
                        {tenancy.owner_name && (
                          <><br/><small className="text-muted">Owner: {tenancy.owner_name}</small></>
                        )}
                      </td>
                      <td>{tenancy.building_name}</td>
                      <td>{new Date(tenancy.start_date).toLocaleDateString()}</td>
                      <td>
                        {tenancy.end_date ? (
                          new Date(tenancy.end_date).toLocaleDateString()
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                      <td>{tenancy.duration_days} days</td>
                      <td>
                        <strong>KES {Number(tenancy.monthly_rent).toLocaleString()}</strong>
                      </td>
                      <td>
                        {tenancy.occupancy_status === 'active' ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">
                            {tenancy.termination_reason || 'Terminated'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{tenancy.payment_count}</strong> payments
                          <br/>
                          <span className="text-success">
                            KES {Number(tenancy.total_payments).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tenancy_history.length === 0 && (
                <div className="text-center py-4">
                  <i className="bx bx-home-alt display-1 text-muted"></i>
                  <h5 className="mt-3">No Tenancy History Found</h5>
                  <p className="text-muted">You don't have any tenancy records yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}