"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SingleTenantPage({ params }) {
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [tenancies, setTenancies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [kpis, setKpis] = useState({});
  const [tenancyStats, setTenancyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState(null);
  const [terminationReason, setTerminationReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      const tenantId = resolvedParams.id;

      try {
        // Fetch tenant data
        const tenantRes = await fetch(`/api/tenants?id=${tenantId}`);
        const tenantData = await tenantRes.json();

        if (tenantData) {
          setTenant(tenantData);

          // Fetch tenancies
          const tenanciesRes = await fetch(
            `/api/tenancies?tenant_id=${tenantId}`
          );
          const tenanciesData = await tenanciesRes.json();
          setTenancies(tenanciesData || []);

          // Fetch tenant's payments
          const paymentsRes = await fetch(`/api/payments`);
          const allPayments = await paymentsRes.json();
          const tenantPayments = allPayments.filter(
            (p) => p.tenant_id.toString() === tenantId.toString()
          );
          setPayments(tenantPayments);

          // Calculate KPIs
          calculateKPIs(tenantPayments, tenantData);
          calculateTenancyStats(tenanciesData || [], tenantPayments);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch tenant data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const calculateKPIs = (payments, tenantData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const paymentsThisMonth = payments.filter((p) => {
      const paymentDate = new Date(p.date_paid);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });

    const totalPayments = payments.length;
    const totalAmountPaid = payments.reduce(
      (sum, p) => sum + (parseFloat(p.amount_paid) || 0),
      0
    );
    const thisMonthAmount = paymentsThisMonth.reduce(
      (sum, p) => sum + (parseFloat(p.amount_paid) || 0),
      0
    );

    let daysSinceLastPayment = 0;
    if (payments.length > 0) {
      const lastPayment = payments.sort(
        (a, b) => new Date(b.date_paid) - new Date(a.date_paid)
      )[0];
      const lastPaymentDate = new Date(lastPayment.date_paid);
      daysSinceLastPayment = Math.floor(
        (currentDate - lastPaymentDate) / (1000 * 60 * 60 * 24)
      );
    }

    setKpis({
      totalPayments,
      totalAmountPaid,
      paymentsThisMonth: paymentsThisMonth.length,
      thisMonthAmount,
      daysSinceLastPayment,
    });
  };

  const calculateTenancyStats = (tenancies, payments) => {
    const activeTenancies = tenancies.filter(
      (t) => t.occupancy_status === "active"
    );
    const totalTenancies = tenancies.length;

    // Calculate average tenancy duration
    let totalDurationDays = 0;
    tenancies.forEach((tenancy) => {
      const startDate = new Date(tenancy.start_date);
      const endDate = tenancy.end_date
        ? new Date(tenancy.end_date)
        : new Date();
      const durationDays = Math.floor(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );
      totalDurationDays += durationDays;
    });
    const avgDurationDays =
      tenancies.length > 0
        ? Math.floor(totalDurationDays / tenancies.length)
        : 0;

    // Total payments for this tenant
    const totalPayments = payments.reduce(
      (sum, p) => sum + (parseFloat(p.amount_paid) || 0),
      0
    );

    setTenancyStats({
      totalTenancies,
      activeTenancies: activeTenancies.length,
      avgDurationDays,
      totalPayments,
    });
  };

  const handleTerminateTenancy = async () => {
    if (!selectedTenancy || !terminationReason) {
      alert("Please select a termination reason");
      return;
    }

    try {
      const response = await fetch(`/api/tenancies/${selectedTenancy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupancy_status: "terminated",
          end_date: new Date().toISOString().split("T")[0],
          termination_reason: terminationReason,
        }),
      });

      if (response.ok) {
        alert("Tenancy terminated successfully");
        setShowTerminateModal(false);
        window.location.reload();
      } else {
        alert("Failed to terminate tenancy");
      }
    } catch (error) {
      console.error("Error terminating tenancy:", error);
      alert("An error occurred");
    }
  };

  useEffect(() => {
    if (!loading && payments.length > 0) {
      setTimeout(() => {
        if (window.initDataTable) {
          window.initDataTable();
        }
      }, 100);
    }
  }, [loading, payments]);

  if (loading) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Loading tenant details...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Tenant not found</p>
            <Link href="/owner_dashboard/tenants" className="btn btn-secondary">
              Back to Tenants
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const currentTenancy = tenancies.find((t) => t.occupancy_status === "active");
  const activeTenancies = tenancies.filter(
    (t) => t.occupancy_status === "active"
  );

  const consolidatedKPIs = [
    // Row 1 - Tenancy Overview
    {
      title: "Total Tenancies",
      value: tenancyStats.totalTenancies || 0,
      icon: "bx bx-home-circle",
      color: "primary",
    },
    {
      title: "Active Tenancies",
      value: tenancyStats.activeTenancies || 0,
      icon: "bx bx-check-circle",
      color: "success",
    },
    {
      title: "Avg Tenancy Duration",
      value: `${Math.floor((tenancyStats.avgDurationDays || 0) / 30)} months`,
      icon: "bx bx-calendar",
      color: "info",
    },
    {
      title: "Current Duration",
      value: currentTenancy
        ? `${Math.floor(
            (new Date() - new Date(currentTenancy.start_date)) /
              (1000 * 60 * 60 * 24 * 30)
          )} months`
        : "N/A",
      icon: "bx bx-time",
      color: "warning",
    },
    // Row 2 - Payment Overview
    {
      title: "Total Amount Paid",
      value: `Ksh ${(kpis.totalAmountPaid || 0).toLocaleString()}`,
      icon: "bx bx-money",
      color: "success",
    },
    {
      title: "Total Payments",
      value: kpis.totalPayments || 0,
      icon: "bx bx-receipt",
      color: "primary",
    },
    {
      title: "This Month Amount",
      value: `Ksh ${(kpis.thisMonthAmount || 0).toLocaleString()}`,
      icon: "bx bx-wallet",
      color: "success",
    },
    {
      title: "Days Since Last Payment",
      value: kpis.daysSinceLastPayment || 0,
      icon: "bx bx-time-five",
      color: kpis.daysSinceLastPayment > 30 ? "danger" : "warning",
    },
  ];

  const personalInfo = [
    {
      label: "Full Name",
      value: tenant.full_name,
      icon: "bx bx-id-card",
      color: "primary",
    },
    {
      label: "Phone",
      value: tenant.phone,
      icon: "bx bx-phone",
      color: "info",
    },
    {
      label: "Email",
      value: tenant.email,
      icon: "bx bx-envelope",
      color: "info",
    },
    {
      label: "Login Password",
      value: tenant.password_text,
      icon: "bx bx-lock-open-alt",
      color: tenant.password_text ? "success" : "secondary",
      type: "code",
    },
    {
      label: "Joined",
      value: tenant.created_at
        ? new Date(tenant.created_at).toLocaleDateString()
        : null,
      icon: "bx bx-calendar",
      color: "warning",
    },
    {
      label: "Tenancy Status",
      value: currentTenancy ? "Active Tenancy" : "No Active Tenancy",
      icon: currentTenancy ? "bx bx-check-circle" : "bx bx-info-circle",
      color: currentTenancy ? "success" : "warning",
      emphasisColor: currentTenancy ? "success" : "warning",
    },
  ];

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-1">{tenant.full_name}</h1>
              <p className="text-muted mb-0">
                <i className="bx bx-envelope me-1"></i>
                {tenant.email || "No email"}
                <span className="mx-2">•</span>
                <i className="bx bx-phone me-1"></i>
                {tenant.phone}
              </p>
            </div>
            <div>
              <Link
                href="/owner_dashboard/tenants"
                className="btn btn-label-secondary me-2"
              >
                <i className="bx bx-arrow-back me-1"></i>Back
              </Link>
              <Link
                href={`/owner_dashboard/tenants/edit/${tenant.id}`}
                className="btn btn-primary"
              >
                <i className="bx bx-edit me-1"></i>Edit Tenant
              </Link>
            </div>
          </div>

          {/* Current Status Card */}
          {currentTenancy ? (
            <div className="card mb-4">
              <div className="card-body">
                <div className="row gy-3 align-items-start">
                  <div className="col-12 col-lg-10">
                    <h5 className="card-title text-success mb-3">
                      <i className="bx bx-check-circle me-2"></i>Currently
                      Active Tenancy
                    </h5>
                    <div className="row gy-2 gx-3">
                      <div className="col-12 col-md-6 col-xl-3">
                        <small className="text-muted">Unit</small>
                        <p className="mb-0 fw-semibold">
                          {currentTenancy.unit_name}
                        </p>
                      </div>
                      <div className="col-12 col-md-6 col-xl-3">
                        <small className="text-muted">Building</small>
                        <p className="mb-0">
                          {currentTenancy.building_name || "Standalone"}
                        </p>
                      </div>
                      <div className="col-6 col-md-4 col-xl-2">
                        <small className="text-muted">Monthly Rent</small>
                        <p className="mb-0 fw-semibold">
                          Ksh{" "}
                          {parseFloat(
                            currentTenancy.monthly_rent || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="col-6 col-md-4 col-xl-2">
                        <small className="text-muted">Start Date</small>
                        <p className="mb-0">
                          {new Date(
                            currentTenancy.start_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="col-12 col-md-4 col-xl-2">
                        <small className="text-muted">Duration</small>
                        <p className="mb-0">
                          {Math.floor(
                            (new Date() - new Date(currentTenancy.start_date)) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-2 d-flex align-items-start justify-content-lg-end">
                    <div className="d-grid w-100">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelectedTenancy(currentTenancy);
                          setShowTerminateModal(true);
                        }}
                      >
                        <i className="bx bx-x me-1"></i>Terminate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning mb-4">
              <i className="bx bx-info-circle me-2"></i>
              This tenant has no active tenancy
            </div>
          )}

          {/* Consolidated KPI Cards */}
          <div className="row mb-4">
            {consolidatedKPIs.map((kpi, idx) => (
              <div className="col-xl-3 col-lg-4 col-md-6 mb-3" key={idx}>
                <div className="card h-100">
                  <div className="card-body">
                    <div className="row align-items-center g-3">
                      <div className="col">
                        <p className="text-muted text-uppercase small fw-semibold mb-1">
                          {kpi.title}
                        </p>
                        <h3 className="card-title mb-0">{kpi.value}</h3>
                      </div>
                      <div className="col-auto">
                        <span
                          className={`badge bg-label-${kpi.color} rounded-circle p-3 d-inline-flex align-items-center justify-content-center`}
                        >
                          <i className={`${kpi.icon} fs-4`}></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tenant Personal Information */}
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0">
                <i className="bx bx-user me-2"></i>Personal Information
              </h5>
              <span className="badge bg-label-primary">
                {personalInfo.length} details
              </span>
            </div>
            <div className="card-body pt-3">
              <div className="row gy-3">
                {personalInfo.map((item) => {
                  const displayValue =
                    item.value !== null &&
                    item.value !== undefined &&
                    item.value !== ""
                      ? item.value
                      : "N/A";

                  return (
                    <div className="col-sm-6 col-lg-4" key={item.label}>
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className={`avatar flex-shrink-0 bg-label-${
                            item.color || "primary"
                          } rounded`}
                        >
                          <span className="avatar-initial rounded">
                            <i className={`${item.icon} fs-5`}></i>
                          </span>
                        </div>
                        <div>
                          <span className="text-uppercase text-muted fw-semibold small d-block">
                            {item.label}
                          </span>
                          {item.type === "code" ? (
                            displayValue !== "N/A" ? (
                              <code className="fw-semibold text-success">
                                {displayValue}
                              </code>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )
                          ) : (
                            <p
                              className={`mb-0 fw-semibold${
                                item.emphasisColor
                                  ? ` text-${item.emphasisColor}`
                                  : ""
                              }`}
                            >
                              {displayValue}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Complete Tenancy History */}
          {tenancies.length > 0 && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="bx bx-history me-2"></i>Complete Tenancy History
                </h5>
                <span className="badge bg-label-primary">
                  {tenancies.length} Total
                </span>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Unit</th>
                        <th>Building</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Duration</th>
                        <th>Monthly Rent</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenancies.map((tenancy, index) => {
                        const startDate = new Date(tenancy.start_date);
                        const endDate = tenancy.end_date
                          ? new Date(tenancy.end_date)
                          : new Date();
                        const durationDays = Math.floor(
                          (endDate - startDate) / (1000 * 60 * 60 * 24)
                        );
                        const durationMonths = Math.floor(durationDays / 30);

                        return (
                          <tr key={tenancy.id}>
                            <td>{index + 1}</td>
                            <td>{tenancy.unit_name}</td>
                            <td>{tenancy.building_name || "Standalone"}</td>
                            <td>{startDate.toLocaleDateString()}</td>
                            <td>
                              {tenancy.end_date
                                ? new Date(
                                    tenancy.end_date
                                  ).toLocaleDateString()
                                : "Ongoing"}
                            </td>
                            <td>
                              {durationMonths} months ({durationDays} days)
                            </td>
                            <td>
                              Ksh{" "}
                              {parseFloat(
                                tenancy.monthly_rent || 0
                              ).toLocaleString()}
                            </td>
                            <td>
                              {tenancy.occupancy_status === "active" && (
                                <span className="badge bg-label-success">
                                  Active
                                </span>
                              )}
                              {tenancy.occupancy_status === "terminated" && (
                                <span className="badge bg-label-danger">
                                  Terminated
                                </span>
                              )}
                              {tenancy.occupancy_status === "moved" && (
                                <span className="badge bg-label-warning">
                                  Moved
                                </span>
                              )}
                            </td>
                            <td>
                              {tenancy.occupancy_status === "active" && (
                                <button
                                  className="btn btn-sm btn-label-danger"
                                  onClick={() => {
                                    setSelectedTenancy(tenancy);
                                    setShowTerminateModal(true);
                                  }}
                                >
                                  <i className="bx bx-x"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bx bx-receipt me-2"></i>All Payments History
              </h5>
              <span className="badge bg-label-success">
                {payments.length} Payments
              </span>
            </div>
            <div className="card-body">
              {payments.length > 0 ? (
                <div className="table-responsive">
                  <table
                    className="table table-hover datatables-basic"
                    data-name={`${tenant.full_name} Payment History`}
                  >
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date Paid</th>
                        <th>Amount</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, index) => (
                        <tr key={payment.id}>
                          <td>{index + 1}</td>
                          <td>
                            {new Date(payment.date_paid).toLocaleDateString()}
                          </td>
                          <td>
                            <strong className="text-success">
                              Ksh{" "}
                              {parseFloat(payment.amount_paid).toLocaleString()}
                            </strong>
                          </td>
                          <td>{payment.notes || "N/A"}</td>
                          <td>
                            <Link
                              href={`/owner_dashboard/payments/edit/${payment.id}`}
                              className="btn btn-sm btn-label-primary"
                            >
                              <i className="bx bx-show me-1"></i>View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-receipt display-1 text-muted"></i>
                  </div>
                  <h5>No Payment History</h5>
                  <p className="text-muted mb-3">
                    This tenant hasn't made any payments yet.
                  </p>
                  <Link
                    href="/owner_dashboard/payments/add"
                    className="btn btn-primary"
                  >
                    <i className="bx bx-plus me-1"></i>Record First Payment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Terminate Tenancy Modal */}
      {showTerminateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Terminate Tenancy</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTerminateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to terminate this tenancy?</p>
                <p>
                  <strong>Unit:</strong> {selectedTenancy?.unit_name}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {selectedTenancy &&
                    new Date(selectedTenancy.start_date).toLocaleDateString()}
                </p>

                <div className="mb-3">
                  <label className="form-label">Termination Reason *</label>
                  <select
                    className="form-select"
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                  >
                    <option value="">Select reason</option>
                    <option value="Lease Expired">Lease Expired</option>
                    <option value="Tenant Request">Tenant Request</option>
                    <option value="Non-Payment">Non-Payment</option>
                    <option value="Violation">Lease Violation</option>
                    <option value="Property Sale">Property Sale</option>
                    <option value="Renovation">Renovation Required</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-label-secondary"
                  onClick={() => setShowTerminateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleTerminateTenancy}
                >
                  Terminate Tenancy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
