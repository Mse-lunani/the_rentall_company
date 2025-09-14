"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TenantHistoryPage({ params }) {
  const router = useRouter();
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantHistory = async () => {
      const resolvedParams = await params;
      const tenantId = resolvedParams.tenant_id;

      try {
        const res = await fetch(`/api/tenancies/tenant/${tenantId}`);
        const data = await res.json();
        
        if (res.ok) {
          setTenantData(data);
        } else {
          console.error("Failed to fetch tenant history:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch tenant history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantHistory();
  }, [params]);

  const handleTerminateTenancy = async (tenancyId) => {
    const reason = prompt("Enter termination reason (evicted, lease-expired, voluntary, transferred):");
    if (!reason || !['evicted', 'lease-expired', 'voluntary', 'transferred'].includes(reason)) {
      alert("Invalid termination reason");
      return;
    }

    const endDate = prompt("Enter end date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!endDate) return;

    const notes = prompt("Enter additional notes (optional):");

    try {
      const res = await fetch(`/api/tenancies/${tenancyId}/terminate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ end_date: endDate, termination_reason: reason, notes })
      });

      if (res.ok) {
        alert("Tenancy terminated successfully");
        window.location.reload();
      } else {
        const error = await res.json();
        alert("Failed to terminate tenancy: " + error.error);
      }
    } catch (err) {
      alert("Failed to terminate tenancy: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Loading tenant history...</p>
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
            <p>Tenant not found</p>
            <Link href="/dashboard/tenants" className="btn btn-secondary">Back to Tenants</Link>
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
              <h1>Tenant History: {tenant.full_name}</h1>
              <p className="text-muted mb-0">Complete tenancy record and statistics</p>
            </div>
            <div>
              <Link href="/dashboard/tenants" className="btn btn-secondary me-2">
                Back to Tenants
              </Link>
              <Link href={`/dashboard/tenants/${tenant.id}`} className="btn btn-primary">
                View Profile
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-primary">{statistics.total_tenancies}</h3>
                  <p className="text-muted mb-0">Total Tenancies</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-success">{statistics.active_tenancies}</h3>
                  <p className="text-muted mb-0">Active Tenancies</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-info">KES {Number(statistics.total_payments_made).toLocaleString()}</h3>
                  <p className="text-muted mb-0">Total Payments</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-warning">{statistics.average_tenancy_duration}</h3>
                  <p className="text-muted mb-0">Avg Days/Tenancy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Active Units */}
          {statistics.current_units && statistics.current_units.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">Current Active Tenancies</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {statistics.current_units.map((unit, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card border-success">
                        <div className="card-body">
                          <h5 className="card-title text-success">{unit.unit_name}</h5>
                          <p className="card-text">
                            <strong>Building:</strong> {unit.building_name}<br/>
                            <strong>Monthly Rent:</strong> KES {Number(unit.monthly_rent).toLocaleString()}<br/>
                            <strong>Start Date:</strong> {new Date(unit.start_date).toLocaleDateString()}
                          </p>
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
              <h3 className="card-title">Complete Tenancy History</h3>
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
                    <th>Payments</th>
                    <th>Actions</th>
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
                          <span className="badge badge-success">Active</span>
                        )}
                      </td>
                      <td>{tenancy.duration_days} days</td>
                      <td>KES {Number(tenancy.monthly_rent).toLocaleString()}</td>
                      <td>
                        {tenancy.occupancy_status === 'active' ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">
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
                      <td>
                        {tenancy.occupancy_status === 'active' && (
                          <>
                            <button
                              className="btn btn-warning btn-sm me-1 mb-1"
                              onClick={() => handleTerminateTenancy(tenancy.id)}
                            >
                              Terminate
                            </button>
                            <Link
                              href={`/dashboard/tenants/${tenant.id}/move`}
                              className="btn btn-info btn-sm mb-1"
                            >
                              Move
                            </Link>
                          </>
                        )}
                        <Link
                          href={`/dashboard/payments?tenancy_id=${tenancy.id}`}
                          className="btn btn-success btn-sm mb-1"
                        >
                          Payments
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tenancy_history.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">No tenancy history found for this tenant.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}