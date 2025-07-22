"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "react-bootstrap";

export default function SingleOwnerPage() {
  const params = useParams();
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buildings');

  useEffect(() => {
    if (params.id) {
      fetch(`/api/owners/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error("Error:", data.error);
          } else {
            setOwnerData(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch owner details:", err);
          setLoading(false);
        });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Loading owner details...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Owner not found</p>
            <Link href="/dashboard/owners" className="btn btn-secondary">
              Back to Owners
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { owner, buildings, units, tenants, recentPayments, kpis } = ownerData;

  const kpiCards = [
    {
      title: "Total Buildings",
      value: kpis.totalBuildings,
      icon: "fa-building",
      color: "primary",
    },
    {
      title: "Total Units",
      value: kpis.totalUnits,
      icon: "fa-door-open",
      color: "info",
    },
    {
      title: "Active Tenants",
      value: kpis.totalTenants,
      icon: "fa-users",
      color: "success",
    },
    {
      title: "Occupancy Rate",
      value: `${kpis.occupancyRate}%`,
      icon: "fa-chart-pie",
      color: "warning",
    },
    {
      title: "Rent Potential",
      value: `Ksh ${kpis.totalRentPotential.toLocaleString()}`,
      icon: "fa-money-bill-wave",
      color: "success",
    },
    {
      title: "Actual Income",
      value: `Ksh ${kpis.actualRentIncome.toLocaleString()}`,
      icon: "fa-coins",
      color: "primary",
    },
  ];

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Owner: {owner.full_name}</h1>
              <p className="text-muted mb-0">
                {owner.email} • {owner.phone}
              </p>
            </div>
            <div>
              <Link href="/dashboard/owners" className="btn btn-secondary me-2">
                Back to Owners
              </Link>
              <Link href={`/dashboard/owners/edit/${owner.id}`} className="btn btn-primary">
                Edit Owner
              </Link>
            </div>
          </div>

          {/* Owner Details Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Owner Information</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Full Name:</strong> {owner.full_name}</p>
                  <p><strong>Phone:</strong> {owner.phone}</p>
                  <p><strong>Email:</strong> {owner.email}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>National ID:</strong> {owner.national_id || "N/A"}</p>
                  <p><strong>Login Password:</strong> <code className="text-success">{owner.password_text}</code></p>
                  <p><strong>Joined:</strong> {new Date(owner.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {owner.address && (
                <div className="row">
                  <div className="col-12">
                    <p><strong>Address:</strong> {owner.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="row mb-4">
            {kpiCards.map((kpi, idx) => (
              <div className="col-lg-4 col-md-6 mb-3" key={idx}>
                <Card className={`border-left-${kpi.color} shadow h-100 py-2`}>
                  <Card.Body>
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className={`text-xs font-weight-bold text-${kpi.color} text-uppercase mb-1`}>
                          {kpi.title}
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {kpi.value}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className={`fas ${kpi.icon} fa-2x text-gray-300`} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>

          {/* Tabs Navigation */}
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'buildings' ? 'active' : ''}`}
                onClick={() => setActiveTab('buildings')}
              >
                Buildings ({buildings.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'units' ? 'active' : ''}`}
                onClick={() => setActiveTab('units')}
              >
                Units ({units.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'tenants' ? 'active' : ''}`}
                onClick={() => setActiveTab('tenants')}
              >
                Tenants ({tenants.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                Recent Payments
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="card">
            <div className="card-body">
              
              {/* Buildings Tab */}
              {activeTab === 'buildings' && (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Building Name</th>
                        <th>Type</th>
                        <th>Units Owned</th>
                        <th>Total Space</th>
                        <th>Occupancy</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buildings.map((building) => (
                        <tr key={building.id}>
                          <td>{building.name}</td>
                          <td>{building.type}</td>
                          <td>{building.units_owned}</td>
                          <td>{building.total_space_sqm} sqm</td>
                          <td>
                            <span className={`badge badge-${
                              building.occupancy_status === 'Fully Occupied' ? 'success' :
                              building.occupancy_status === 'Partially Occupied' ? 'warning' : 'danger'
                            }`}>
                              {building.occupancy_status}
                            </span>
                          </td>
                          <td>{new Date(building.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link href={`/dashboard/property_records/buildings/edit/${building.id}`} className="btn btn-sm btn-primary">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {buildings.length === 0 && (
                    <p className="text-center text-muted py-4">No buildings found for this owner.</p>
                  )}
                </div>
              )}

              {/* Units Tab */}
              {activeTab === 'units' && (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Unit Name</th>
                        <th>Building</th>
                        <th>Rent Amount</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((unit) => (
                        <tr key={unit.id}>
                          <td>{unit.name}</td>
                          <td>{unit.building_name || 'Standalone'}</td>
                          <td>Ksh {unit.rent_amount_kes?.toLocaleString() || 'N/A'}</td>
                          <td>
                            <span className={`badge badge-${unit.status === 'occupied' ? 'success' : 'warning'}`}>
                              {unit.status || 'Available'}
                            </span>
                          </td>
                          <td>{new Date(unit.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link href={`/dashboard/property_records/units/edit/${unit.id}`} className="btn btn-sm btn-primary">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {units.length === 0 && (
                    <p className="text-center text-muted py-4">No units found for this owner.</p>
                  )}
                </div>
              )}

              {/* Tenants Tab */}
              {activeTab === 'tenants' && (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tenant Name</th>
                        <th>Phone</th>
                        <th>Unit</th>
                        <th>Building</th>
                        <th>Rent</th>
                        <th>Start Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => (
                        <tr key={tenant.id}>
                          <td>{tenant.full_name}</td>
                          <td>{tenant.phone}</td>
                          <td>{tenant.unit_name}</td>
                          <td>{tenant.building_name || 'Standalone'}</td>
                          <td>Ksh {tenant.rent_amount_kes?.toLocaleString() || 'N/A'}</td>
                          <td>{new Date(tenant.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link href={`/dashboard/tenants/edit/${tenant.id}`} className="btn btn-sm btn-primary">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tenants.length === 0 && (
                    <p className="text-center text-muted py-4">No tenants found for this owner's properties.</p>
                  )}
                </div>
              )}

              {/* Recent Payments Tab */}
              {activeTab === 'payments' && (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Tenant</th>
                        <th>Unit</th>
                        <th>Building</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td>{payment.tenant_name}</td>
                          <td>{payment.unit_name}</td>
                          <td>{payment.building_name || 'Standalone'}</td>
                          <td>Ksh {payment.amount_paid.toLocaleString()}</td>
                          <td>
                            <Link href={`/dashboard/payments/edit/${payment.id}`} className="btn btn-sm btn-primary">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recentPayments.length === 0 && (
                    <p className="text-center text-muted py-4">No recent payments found for this owner's properties.</p>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </section>
    </div>
  );
}