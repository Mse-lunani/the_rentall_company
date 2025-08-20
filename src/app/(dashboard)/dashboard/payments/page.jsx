"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize DataTable after payments load
  useEffect(() => {
    if (!loading && payments.length > 0) {
      setTimeout(() => {
        if (window.initDataTable) {
          window.initDataTable();
        }
      }, 100);
    }
  }, [loading, payments]);
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
      const data = await res.json();
      setPayments(data || []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPayments();
  }, []);
  const handleDelete = async (id) => {};

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Tenant Payments</h4>
            <Link href="/dashboard/payments/add" className="btn btn-primary">
              + Record Payment
            </Link>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped datatables-basic" data-name="Payment Records">
                  <thead>
                    <tr>
                      <th style={{width: '15px'}}></th>
                      <th>Tenant</th>
                      <th>Amount (Ksh)</th>
                      <th>Date</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, index) => (
                      <tr key={p.id}>
                        <td></td>
                        <td><strong>{p.full_name}</strong></td>
                        <td><strong>Ksh {p.amount_paid?.toLocaleString()}</strong></td>
                        <td>{p.date_paid}</td>
                        <td>{p.notes}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <Link
                              href={`/dashboard/payments/edit/${p.id}`}
                              className="btn btn-warning btn-sm"
                              title="Edit Payment"
                            >
                              <i className="bx bx-edit"></i>
                            </Link>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(p.id)}
                              title="Delete Payment"
                            >
                              <i className="bx bx-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No payments recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
