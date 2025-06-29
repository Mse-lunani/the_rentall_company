"use client";
import { useState } from "react";
import Link from "next/link";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: 1,
      tenant: "Alice Wanjiku",
      amount: 15000,
      date: "2025-06-28",
      notes: "June Rent",
    },
    {
      id: 2,
      tenant: "John Otieno",
      amount: 6000,
      date: "2025-06-20",
      notes: "Partial (June)",
    },
  ]);

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
                </tr>
              </thead>
              <tbody>
                {payments.map((p, index) => (
                  <tr key={p.id}>
                    <td>{index + 1}</td>
                    <td>{p.tenant}</td>
                    <td>{p.amount.toLocaleString()}</td>
                    <td>{p.date}</td>
                    <td>{p.notes}</td>
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
