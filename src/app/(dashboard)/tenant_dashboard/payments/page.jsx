"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TenantPaymentsPage() {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const res = await fetch(`/api/tenants_apis/payments`);
        const data = await res.json();

        if (res.ok) {
          setPaymentData(data);
        } else {
          console.error("Failed to fetch payment data:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch payment data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge bg-success">Paid</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'overdue':
        return <span className="badge bg-danger">Overdue</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getDaysText = (days, isFirstPayment) => {
    if (days < 0) {
      if (isFirstPayment) {
        return `Overdue by ${Math.abs(days)} days`;
      }
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else {
      if (isFirstPayment) {
        return `Due in ${days} days`;
      }
      return `${days} days remaining`;
    }
  };

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
                <p className="mt-3">Loading your payment information...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <div className="text-center mt-5">
              <i className="bx bx-error-circle display-1 text-danger"></i>
              <h4>Unable to load payment information</h4>
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

  const { activeTenancies, paymentHistory, summary } = paymentData;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>
                <i className="bx bx-money me-2"></i>
                My Payments
              </h1>
              <p className="text-muted mb-0">View your payment history and upcoming due dates</p>
            </div>
            <div>
              <Link href="/tenant_dashboard" className="btn btn-outline-primary">
                <i className="bx bx-arrow-back me-1"></i>
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bx bx-home-alt display-4 mb-2 text-primary"></i>
                  <h3>{summary.total_active_tenancies}</h3>
                  <p className="mb-0">Active Tenancies</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bx bx-check-circle display-4 mb-2 text-success"></i>
                  <h3>{summary.paid_count}</h3>
                  <p className="mb-0">Paid This Month</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bx bx-time display-4 mb-2 text-warning"></i>
                  <h3>{summary.pending_count}</h3>
                  <p className="mb-0">Pending Payments</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bx bx-error-circle display-4 mb-2 text-danger"></i>
                  <h3>{summary.overdue_count}</h3>
                  <p className="mb-0">Overdue Payments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">
                {summary.overdue_count > 0 ? (
                  <>
                    <i className="bx bx-error-circle me-2 text-danger"></i>
                    <span className="text-danger">Overdue Payments</span>
                  </>
                ) : summary.pending_count > 0 ? (
                  <>
                    <i className="bx bx-calendar-check me-2"></i>
                    Next Payment Due: {new Date(summary.next_payment_due).toLocaleDateString()}
                  </>
                ) : (
                  <>
                    <i className="bx bx-check-circle me-2 text-success"></i>
                    <span className="text-success">All Payments Up to Date</span>
                  </>
                )}
              </h3>
            </div>
            <div className="card-body">
              {summary.overdue_count > 0 ? (
                <p className="text-danger mb-3">
                  <i className="bx bx-error-circle me-1"></i>
                  You have {summary.overdue_count} overdue payment{summary.overdue_count > 1 ? 's' : ''}. Please pay immediately to avoid late fees.
                </p>
              ) : summary.pending_count > 0 ? (
                <p className="text-muted mb-3">
                  <i className="bx bx-info-circle me-1"></i>
                  Rent payments are due on the 5th of every month. Please ensure timely payment to avoid late fees.
                </p>
              ) : (
                <p className="text-success mb-3">
                  <i className="bx bx-check-circle me-1"></i>
                  Great! All your payments are up to date. Your next payment will be due on the 5th of next month.
                </p>
              )}
              <div className="row">
                {summary.overdue_count > 0 ? (
                  <>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="text-danger">
                          KES {activeTenancies
                            .filter(t => t.payment_status === 'overdue')
                            .reduce((sum, t) => sum + Number(t.amount_due), 0)
                            .toLocaleString()}
                        </h4>
                        <p className="text-muted">Total Overdue Amount</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="text-warning">{summary.overdue_count}</h4>
                        <p className="text-muted">Overdue Payment{summary.overdue_count > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="text-success">KES {summary.total_amount_paid.toLocaleString()}</h4>
                        <p className="text-muted">Total Paid to Date</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="text-primary">KES {summary.total_monthly_rent.toLocaleString()}</h4>
                        <p className="text-muted">Total Monthly Rent</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="text-success">KES {summary.total_amount_paid.toLocaleString()}</h4>
                        <p className="text-muted">Total Paid to Date</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="text-info">{summary.total_payments_made}</h4>
                        <p className="text-muted">Total Payments Made</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Active Tenancies Payment Status */}
          {activeTenancies.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="bx bx-home me-2"></i>
                  Current Tenancies - Payment Status
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Unit</th>
                        <th>Building</th>
                        <th>Amount Due</th>
                        <th>Payment Status</th>
                        <th>Due Date</th>
                        <th>Days Until Due</th>
                        <th>Last Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTenancies.map((tenancy) => (
                        <tr key={tenancy.tenancy_id}>
                          <td><strong>{tenancy.unit_name}</strong></td>
                          <td>{tenancy.building_name}</td>
                          <td>
                            <div>
                              <strong className="text-primary">KES {Number(tenancy.amount_due).toLocaleString()}</strong>
                              {tenancy.is_first_payment && (
                                <div className="mt-1">
                                  <small className="text-muted d-block">
                                    Deposit: KES {Number(tenancy.deposit_amount).toLocaleString()}
                                  </small>
                                  <small className="text-muted d-block">
                                    Pro-rated rent: KES {Number(tenancy.pro_rated_rent).toLocaleString()}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{getStatusBadge(tenancy.payment_status)}</td>
                          <td>{new Date(tenancy.next_due_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`text-${tenancy.days_until_due < 0 ? 'danger' : tenancy.days_until_due <= 3 ? 'warning' : 'success'}`}>
                              {getDaysText(tenancy.days_until_due, tenancy.is_first_payment)}
                            </span>
                          </td>
                          <td>
                            {tenancy.last_payment_date ?
                              new Date(tenancy.last_payment_date).toLocaleDateString() :
                              <span className="text-muted">No payments yet</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="bx bx-history me-2"></i>
                Payment History
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Date Paid</th>
                      <th>Unit</th>
                      <th>Building</th>
                      <th>Amount Paid</th>
                      <th>Monthly Rent</th>
                      <th>Payment Method</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td>{new Date(payment.date_paid).toLocaleDateString()}</td>
                        <td><strong>{payment.unit_name}</strong></td>
                        <td>{payment.building_name}</td>
                        <td>
                          <strong className="text-success">
                            KES {Number(payment.amount_paid).toLocaleString()}
                          </strong>
                        </td>
                        <td>KES {Number(payment.monthly_rent).toLocaleString()}</td>
                        <td>
                          <span className="badge bg-info">
                            {payment.payment_method || 'Not specified'}
                          </span>
                        </td>
                        <td>{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {paymentHistory.length === 0 && (
                  <div className="text-center py-4">
                    <i className="bx bx-money display-1 text-muted"></i>
                    <h5 className="mt-3">No Payment History Found</h5>
                    <p className="text-muted">You haven't made any payments yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}