"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SingleTenantPage({ params }) {
  const [tenant, setTenant] = useState(null);
  const [unit, setUnit] = useState(null);
  const [payments, setPayments] = useState([]);
  const [tenancyHistory, setTenancyHistory] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      const tenantId = resolvedParams.id;

      try {
        // Fetch tenant data
        const tenantRes = await fetch(`/api/tenants?id=${tenantId}`);
        const tenantData = await tenantRes.json();
        console.log("[TenantDashboard] Tenant API response:", tenantData);

        if (tenantData) {
          setTenant(tenantData);

          const fallbackUnit =
            tenantData.unit_id != null
              ? {
                  id: tenantData.unit_id,
                  name:
                    tenantData.unit_name ||
                    tenantData.unit_number ||
                    `Unit ${tenantData.unit_id}`,
                  building_name:
                    tenantData.building_name ||
                    tenantData.property_name ||
                    "Standalone",
                  building_id: tenantData.building_id ?? null,
                  rent_amount_kes:
                    tenantData.tenancy_rent ??
                    tenantData.rent_amount_kes ??
                    tenantData.monthly_rent ??
                    null,
                }
              : null;

          // Fetch tenant's payments
          const paymentsRes = await fetch(`/api/payments`);
          const allPayments = await paymentsRes.json();
          const tenantPayments = allPayments.filter(
            (p) => p.tenant_id.toString() === tenantId.toString()
          );
          setPayments(tenantPayments);

          // Fetch tenancy history
          try {
            const historyRes = await fetch(`/api/tenancies/tenant/${tenantId}`);
            const historyData = await historyRes.json();
            console.log(
              "[TenantDashboard] Tenancy history response:",
              historyData
            );
            if (historyRes.ok) {
              setTenancyHistory(historyData.tenancy_history || []);
              setStatistics(historyData.statistics || {});
              if (historyData.tenant) {
                setTenant((prev) =>
                  prev ? { ...prev, ...historyData.tenant } : historyData.tenant
                );
              }
            }
          } catch (err) {
            console.error("Failed to fetch tenancy history:", err);
            setTenancyHistory([]);
            setStatistics({});
          }

          let resolvedUnit = fallbackUnit;
          if (tenantData.unit_id) {
            try {
              const unitRes = await fetch(
                `/api/property-records?unit_type=all&include_occupied=true`
              );
              const unitData = await unitRes.json();
              const tenantUnit = Array.isArray(unitData.units)
                ? unitData.units.find(
                    (u) => u.id.toString() === tenantData.unit_id.toString()
                  )
                : null;
              resolvedUnit = tenantUnit || fallbackUnit;
            } catch (unitErr) {
              console.error("Failed to fetch unit details:", unitErr);
            }
          }
          setUnit(resolvedUnit ?? null);

          // Calculate KPIs
          calculateKPIs(tenantPayments, tenantData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch tenant data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }
    return parsedDate.toLocaleDateString();
  };

  const handleTerminateTenancy = async (tenancyId) => {
    const reason = prompt(
      "Enter termination reason (evicted, lease-expired, voluntary, transferred):"
    );
    if (
      !reason ||
      !["evicted", "lease-expired", "voluntary", "transferred"].includes(reason)
    ) {
      alert("Invalid termination reason");
      return;
    }

    const endDate = prompt(
      "Enter end date (YYYY-MM-DD):",
      new Date().toISOString().split("T")[0]
    );
    if (!endDate) return;

    const notes = prompt("Enter additional notes (optional):");

    try {
      const res = await fetch(`/api/tenancies/${tenancyId}/terminate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          end_date: endDate,
          termination_reason: reason,
          notes,
        }),
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

  const calculateKPIs = (payments, tenantData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Payments this month
    const paymentsThisMonth = payments.filter((p) => {
      const paymentDate = new Date(p.date_paid);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });

    // Total payments made
    const totalPayments = payments.length;
    const totalAmountPaid = payments.reduce(
      (sum, p) => sum + (parseFloat(p.amount_paid) || 0),
      0
    );

    // This month payments amount
    const thisMonthAmount = paymentsThisMonth.reduce(
      (sum, p) => sum + (parseFloat(p.amount_paid) || 0),
      0
    );

    // Days since last payment
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

    // Tenancy duration
    const tenancyStartDate = new Date(tenantData.created_at);
    const tenancyDurationDays = Math.floor(
      (currentDate - tenancyStartDate) / (1000 * 60 * 60 * 24)
    );
    const tenancyDurationMonths = Math.floor(tenancyDurationDays / 30);

    setKpis({
      totalPayments,
      totalAmountPaid,
      paymentsThisMonth: paymentsThisMonth.length,
      thisMonthAmount,
      daysSinceLastPayment,
      tenancyDurationDays,
      tenancyDurationMonths,
      averageMonthlyPayment:
        tenancyDurationMonths > 0
          ? Math.round(totalAmountPaid / tenancyDurationMonths)
          : 0,
    });
  };

  // Initialize DataTable for payments after data loads
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
            <Link href="/dashboard/tenants" className="btn btn-secondary">
              Back to Tenants
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const historyActiveTenancy = tenancyHistory.find(
    (t) => t.occupancy_status === "active"
  );
  const fallbackActiveUnit =
    statistics.current_units && statistics.current_units.length > 0
      ? statistics.current_units[0]
      : null;
  const currentTenancy = historyActiveTenancy
    ? historyActiveTenancy
    : fallbackActiveUnit
    ? {
        ...fallbackActiveUnit,
        unit_name:
          fallbackActiveUnit.unit_name || fallbackActiveUnit.name || "Unknown",
        building_name:
          fallbackActiveUnit.building_name || fallbackActiveUnit.property_name,
        monthly_rent:
          fallbackActiveUnit.monthly_rent ?? fallbackActiveUnit.rent_amount_kes,
        start_date: fallbackActiveUnit.start_date,
        occupancy_status: "active",
      }
    : null;
  const currentTenancyStartDate = currentTenancy?.start_date
    ? new Date(currentTenancy.start_date)
    : null;
  const currentTenancyDurationDays = currentTenancyStartDate
    ? Math.floor((new Date() - currentTenancyStartDate) / (1000 * 60 * 60 * 24))
    : null;
  const currentTenancyDurationMonths = currentTenancyDurationDays
    ? Math.floor(currentTenancyDurationDays / 30)
    : null;

  const resolvedUnitFromTenancy = currentTenancy
    ? {
        name: currentTenancy.unit_name,
        building_name: currentTenancy.building_name,
        monthly_rent:
          currentTenancy.monthly_rent ?? currentTenancy.rent_amount_kes ?? null,
      }
    : null;

  const resolvedUnitName =
    unit?.name ||
    unit?.unit_name ||
    resolvedUnitFromTenancy?.name ||
    tenant.unit_name ||
    tenant.unit_number ||
    null;

  const resolvedBuildingName =
    unit?.building_name ||
    resolvedUnitFromTenancy?.building_name ||
    tenant.building_name ||
    (resolvedUnitName ? "Standalone" : null);

  const resolvedUnitDisplay = resolvedUnitName
    ? resolvedBuildingName
      ? `${resolvedUnitName} (${resolvedBuildingName})`
      : resolvedUnitName
    : "No unit assigned";

  const resolvedUnitLink =
    unit && unit.building_id
      ? `/dashboard/property_records/buildings/${unit.building_id}`
      : unit && unit.building_name === "Standalone"
      ? "/dashboard/units/standalone"
      : null;

  const resolvedFullName = tenant.full_name ?? tenant.name ?? "";
  const resolvedPhone = tenant.phone ?? tenant.phone_number ?? "";
  const resolvedEmail = tenant.email ?? "";
  const resolvedPassword = tenant.password_text ?? "";
  const joinedDisplay =
    formatDate(tenant.created_at) ?? formatDate(currentTenancy?.start_date);

  const tenancyStatusLabel = currentTenancy
    ? "Active Tenancy"
    : tenant.occupancy_status === "active"
    ? "Active Tenancy"
    : tenant.occupancy_status
    ? tenant.occupancy_status.replace(/_/g, " ")
    : "No Active Tenancy";

  const tenancyStatusColor = currentTenancy
    ? "success"
    : tenant.occupancy_status === "active"
    ? "success"
    : tenant.occupancy_status
    ? "warning"
    : "warning";

  const hasActiveTenancy = tenancyStatusColor === "success";

  const consolidatedKPIs = [
    {
      title: "Total Tenancies",
      value:
        statistics.total_tenancies ??
        (tenancyHistory ? tenancyHistory.length : 0),
      icon: "bx bx-home-circle",
      color: "primary",
    },
    {
      title: "Active Tenancies",
      value: statistics.active_tenancies || (currentTenancy ? 1 : 0),
      icon: "bx bx-check-circle",
      color: "success",
    },
    {
      title: "Avg Tenancy Duration",
      value: `${Math.floor(
        (statistics.average_tenancy_duration || 0) / 30
      )} months`,
      icon: "bx bx-calendar",
      color: "info",
    },
    {
      title: "Current Duration",
      value:
        currentTenancyDurationMonths !== null
          ? `${currentTenancyDurationMonths} months`
          : "N/A",
      icon: "bx bx-time",
      color: "warning",
    },
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
      value: resolvedFullName,
      icon: "bx bx-id-card",
      color: "primary",
    },
    {
      label: "Phone",
      value: resolvedPhone,
      icon: "bx bx-phone",
      color: "info",
    },
    {
      label: "Email",
      value: resolvedEmail || "No email",
      icon: "bx bx-envelope",
      color: "info",
    },
    {
      label: "Login Password",
      value: resolvedPassword,
      icon: "bx bx-lock-open-alt",
      color: resolvedPassword ? "success" : "secondary",
      type: "code",
    },
    {
      label: "Joined",
      value: joinedDisplay,
      icon: "bx bx-calendar",
      color: "warning",
    },
    {
      label: "Current Unit",
      value: resolvedUnitDisplay,
      icon: "bx bx-building",
      color: resolvedUnitName ? "primary" : "secondary",
      link: resolvedUnitLink,
    },
    {
      label: "Tenancy Status",
      value: tenancyStatusLabel,
      icon: hasActiveTenancy ? "bx bx-check-circle" : "bx bx-info-circle",
      color: tenancyStatusColor,
      emphasisColor: tenancyStatusColor,
    },
    {
      label: "Total Tenancies",
      value:
        statistics.total_tenancies ??
        (tenancyHistory ? tenancyHistory.length : 0),
      icon: "bx bx-layer",
      color: "primary",
    },
    {
      label: "Total Payments",
      value: payments.length,
      icon: "bx bx-spreadsheet",
      color: "info",
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
                {tenant.phone || "N/A"}
              </p>
            </div>
            <div>
              <Link
                href="/dashboard/tenants"
                className="btn btn-label-secondary me-2"
              >
                <i className="bx bx-arrow-back me-1"></i>Back
              </Link>
              <Link
                href={`/dashboard/tenants/edit/${tenant.id}`}
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
                          {Number(
                            currentTenancy.monthly_rent ??
                              currentTenancy.rent_amount_kes ??
                              0
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
                          {currentTenancyDurationDays !== null
                            ? `${currentTenancyDurationDays} days`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-2 d-flex align-items-start justify-content-lg-end">
                    <div className="d-grid w-100">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          handleTerminateTenancy(currentTenancy.id)
                        }
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
                  const hasValue =
                    item.value !== null &&
                    item.value !== undefined &&
                    item.value !== "";
                  const displayValue = hasValue ? item.value : "N/A";

                  let valueContent;
                  if (item.type === "code") {
                    valueContent = hasValue ? (
                      <code className="fw-semibold text-success">
                        {displayValue}
                      </code>
                    ) : (
                      <span className="text-muted">N/A</span>
                    );
                  } else if (item.link && hasValue) {
                    valueContent = (
                      <Link
                        href={item.link}
                        className="fw-semibold text-primary"
                      >
                        {displayValue}
                      </Link>
                    );
                  } else {
                    valueContent = (
                      <span
                        className={`fw-semibold${
                          item.emphasisColor
                            ? ` text-${item.emphasisColor}`
                            : ""
                        }`}
                      >
                        {displayValue}
                      </span>
                    );
                  }

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
                          {valueContent}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card mb-4">
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
                              href={`/dashboard/payments/edit/${payment.id}`}
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
                    href="/dashboard/payments/add"
                    className="btn btn-primary"
                  >
                    <i className="bx bx-plus me-1"></i>Record First Payment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Tenancy History Section */}
          {tenancyHistory.length > 0 && (
            <>
              {statistics.current_units &&
                statistics.current_units.length > 0 && (
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">
                        <i className="bx bx-home-heart me-2"></i>Current Active
                        Tenancies
                      </h5>
                      <span className="badge bg-label-success">
                        {statistics.current_units.length} Active
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        {statistics.current_units.map((activeUnit, index) => (
                          <div key={index} className="col-md-6">
                            <div className="d-flex align-items-start gap-3 border rounded-3 p-3 h-100">
                              <div className="avatar flex-shrink-0 bg-label-success rounded">
                                <span className="avatar-initial rounded">
                                  <i className="bx bx-building-house fs-4"></i>
                                </span>
                              </div>
                              <div>
                                <h6 className="mb-1 text-success">
                                  {activeUnit.unit_name}
                                </h6>
                                <p className="mb-1 text-muted small">
                                  {activeUnit.building_name}
                                </p>
                                <p className="mb-0 fw-semibold">
                                  Ksh{" "}
                                  {Number(
                                    activeUnit.monthly_rent ??
                                      activeUnit.rent_amount_kes ??
                                      0
                                  ).toLocaleString()}
                                </p>
                                <small className="text-muted">
                                  Started{" "}
                                  {new Date(
                                    activeUnit.start_date
                                  ).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* Complete Tenancy History Table */}
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="bx bx-history me-2"></i>Complete Tenancy
                    History
                  </h5>
                  <span className="badge bg-label-primary">
                    {tenancyHistory.length} Total
                  </span>
                </div>
                <div className="card-body table-responsive">
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
                        <th>Payments</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenancyHistory.map((tenancy, index) => (
                        <tr key={tenancy.id}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{tenancy.unit_name}</strong>
                            {tenancy.owner_name && (
                              <div className="text-muted small">
                                Owner: {tenancy.owner_name}
                              </div>
                            )}
                          </td>
                          <td>{tenancy.building_name || "Standalone"}</td>
                          <td>
                            {tenancy.start_date
                              ? new Date(
                                  tenancy.start_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            {tenancy.end_date ? (
                              new Date(tenancy.end_date).toLocaleDateString()
                            ) : (
                              <span className="badge bg-label-success">
                                Ongoing
                              </span>
                            )}
                          </td>
                          <td>{tenancy.duration_days} days</td>
                          <td>
                            Ksh{" "}
                            {Number(tenancy.monthly_rent || 0).toLocaleString()}
                          </td>
                          <td>
                            {tenancy.occupancy_status === "active" ? (
                              <span className="badge bg-label-success">
                                Active
                              </span>
                            ) : (
                              <span className="badge bg-label-danger">
                                {tenancy.termination_reason || "Terminated"}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {tenancy.payment_count} payments
                            </div>
                            <span className="text-success">
                              Ksh{" "}
                              {Number(
                                tenancy.total_payments || 0
                              ).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            {tenancy.occupancy_status === "active" && (
                              <div className="d-flex flex-wrap gap-2">
                                <button
                                  className="btn btn-sm btn-label-danger"
                                  onClick={() =>
                                    handleTerminateTenancy(tenancy.id)
                                  }
                                >
                                  <i className="bx bx-x"></i>
                                </button>
                                <Link
                                  href={`/dashboard/tenants/${tenant.id}/move`}
                                  className="btn btn-sm btn-label-info"
                                >
                                  <i className="bx bx-transfer"></i>
                                </Link>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
