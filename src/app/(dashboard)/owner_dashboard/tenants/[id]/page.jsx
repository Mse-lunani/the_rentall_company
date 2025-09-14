"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SingleTenantPage({ params }) {
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [unit, setUnit] = useState(null);
  const [payments, setPayments] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
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
        
        if (tenantData) {
          setTenant(tenantData);
          
          // Fetch tenant's payments
          const paymentsRes = await fetch(`/api/payments`);
          const allPayments = await paymentsRes.json();
          const tenantPayments = allPayments.filter(p => p.tenant_id.toString() === tenantId.toString());
          setPayments(tenantPayments);
          
          // Fetch unit details
          if (tenantData.unit_id) {
            const unitRes = await fetch(`/api/property-records?unit_type=all&include_occupied=true`);
            const unitData = await unitRes.json();
            const tenantUnit = unitData.units.find(u => u.id.toString() === tenantData.unit_id.toString());
            setUnit(tenantUnit);
            
            // Fetch maintenance logs for this unit (simulated - you'll need actual API)
            // For now, we'll use empty array or mock data
            setMaintenanceLogs([]);
          }
          
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

  const calculateKPIs = (payments, tenantData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Payments this month
    const paymentsThisMonth = payments.filter(p => {
      const paymentDate = new Date(p.date_paid);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    
    // Total payments made
    const totalPayments = payments.length;
    const totalAmountPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);
    
    // This month payments amount
    const thisMonthAmount = paymentsThisMonth.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);
    
    // Days since last payment
    let daysSinceLastPayment = 0;
    if (payments.length > 0) {
      const lastPayment = payments.sort((a, b) => new Date(b.date_paid) - new Date(a.date_paid))[0];
      const lastPaymentDate = new Date(lastPayment.date_paid);
      daysSinceLastPayment = Math.floor((currentDate - lastPaymentDate) / (1000 * 60 * 60 * 24));
    }
    
    // Tenancy duration
    const tenancyStartDate = new Date(tenantData.created_at);
    const tenancyDurationDays = Math.floor((currentDate - tenancyStartDate) / (1000 * 60 * 60 * 24));
    const tenancyDurationMonths = Math.floor(tenancyDurationDays / 30);

    setKpis({
      totalPayments,
      totalAmountPaid,
      paymentsThisMonth: paymentsThisMonth.length,
      thisMonthAmount,
      daysSinceLastPayment,
      tenancyDurationDays,
      tenancyDurationMonths,
      averageMonthlyPayment: tenancyDurationMonths > 0 ? Math.round(totalAmountPaid / tenancyDurationMonths) : 0
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

  const kpiCards = [
    {
      title: "Total Payments",
      value: kpis.totalPayments || 0,
      icon: "fa-receipt",
      color: "primary",
    },
    {
      title: "Amount Paid",
      value: `Ksh ${(kpis.totalAmountPaid || 0).toLocaleString()}`,
      icon: "fa-money-bill-wave",
      color: "success",
    },
    {
      title: "This Month Payments",
      value: kpis.paymentsThisMonth || 0,
      icon: "fa-calendar-check",
      color: "info",
    },
    {
      title: "This Month Amount",
      value: `Ksh ${(kpis.thisMonthAmount || 0).toLocaleString()}`,
      icon: "fa-coins",
      color: "success",
    },
    {
      title: "Days Since Last Payment",
      value: kpis.daysSinceLastPayment || 0,
      icon: "fa-clock",
      color: kpis.daysSinceLastPayment > 30 ? "danger" : "warning",
    },
    {
      title: "Tenancy Duration",
      value: `${kpis.tenancyDurationMonths || 0} months`,
      icon: "fa-calendar-alt",
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
              <h1>Tenant: {tenant.full_name}</h1>
              <p className="text-muted mb-0">
                {tenant.email} • {tenant.phone}
              </p>
            </div>
            <div>
              <Link href="/dashboard/tenants" className="btn btn-secondary me-2">
                Back to Tenants
              </Link>
              <Link href={`/dashboard/tenants/edit/${tenant.id}`} className="btn btn-primary">
                Edit Tenant
              </Link>
            </div>
          </div>

          {/* Tenant Details Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Tenant Information</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Full Name:</strong> {tenant.full_name}</p>
                  <p><strong>Phone:</strong> {tenant.phone}</p>
                  <p><strong>Email:</strong> {tenant.email || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Login Password:</strong> <code className="text-success">{tenant.password_text || "N/A"}</code></p>
                  <p><strong>Joined:</strong> {new Date(tenant.created_at).toLocaleDateString()}</p>
                  <p><strong>Unit:</strong> 
                    {unit ? (
                      <Link href={unit.building_name === 'Standalone' ? `/dashboard/units/standalone` : `/dashboard/property_records/buildings/${unit.building_id}`} className="text-primary ms-2">
                        {unit.name} ({unit.building_name})
                      </Link>
                    ) : (
                      <span className="text-muted ms-2">No unit assigned</span>
                    )}
                  </p>
                </div>
              </div>
              {unit && (
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="alert alert-light">
                      <h6 className="alert-heading mb-2">Current Unit Details</h6>
                      <div className="row">
                        <div className="col-md-3">
                          <small className="text-muted">Monthly Rent</small>
                          <p className="mb-0"><strong>Ksh {unit.rent_amount_kes?.toLocaleString() || "N/A"}</strong></p>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">Bedrooms</small>
                          <p className="mb-0">{unit.bedrooms || "N/A"}</p>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">Bathrooms</small>
                          <p className="mb-0">{unit.bathrooms || "N/A"}</p>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">Owner</small>
                          <p className="mb-0">
                            {unit.owner_name ? (
                              <Link href={`/dashboard/owners/${unit.owner_id}`} className="text-primary">
                                {unit.owner_name}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="row mb-4">
            {kpiCards.map((kpi, idx) => (
              <div className="col-lg-4 col-md-6 mb-3" key={idx}>
                <div className={`card border-left-${kpi.color} shadow h-100 py-2`}>
                  <div className="card-body">
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
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment History */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payment History</h3>
            </div>
            <div className="card-body">
              {payments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover datatables-basic" data-name={`${tenant.full_name} Payment History`}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Unit</th>
                        <th>Building</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, index) => (
                        <tr key={payment.id}>
                          <td>{index + 1}</td>
                          <td>{new Date(payment.date_paid).toLocaleDateString()}</td>
                          <td>
                            <strong>Ksh {parseFloat(payment.amount_paid).toLocaleString()}</strong>
                          </td>
                          <td>{payment.unit_number}</td>
                          <td>{payment.building_name || 'Standalone'}</td>
                          <td>{payment.notes || "N/A"}</td>
                          <td>
                            <Link
                              href={`/dashboard/payments/edit/${payment.id}`}
                              className="btn btn-sm btn-primary"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <i className="fas fa-receipt display-1 text-muted"></i>
                  </div>
                  <h5>No Payment History</h5>
                  <p className="text-muted mb-3">
                    This tenant hasn't made any payments yet.
                  </p>
                  <Link href="/dashboard/payments/add" className="btn btn-primary">
                    Record First Payment
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}