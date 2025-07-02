"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
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

          <div className="card card-body shadow-sm">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tenant</th>
                  <th>Amount (Ksh)</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, index) => (
                  <tr key={p.id}>
                    <td>{index + 1}</td>
                    <td>{p.full_name}</td>
                    <td>{p.amount_paid.toLocaleString()}</td>
                    <td>{p.date_paid}</td>
                    <td>{p.notes}</td>
                    <td>
                      <Link
                        href={`/dashboard/payments/edit/${p.id}`}
                        className="btn btn-sm btn-success me-2"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(tenant.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
