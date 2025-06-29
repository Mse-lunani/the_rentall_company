"use client";
import { useState } from "react";

export default function PaymentForm({ tenants }) {
  const [form, setForm] = useState({
    tenantId: "",
    amount: "",
    date: new Date().toISOString().substring(0, 10),
    notes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Payment Recorded:\n\n${JSON.stringify(form, null, 2)}`);
    setForm({
      tenantId: "",
      amount: "",
      date: new Date().toISOString().substring(0, 10),
      notes: "",
    });
  };

  const dummyRent = 25000;
  const paid = parseFloat(form.amount || 0);
  const difference = paid - dummyRent;

  let statusMessage = "";
  let badgeClass = "";

  if (paid > 0) {
    if (difference === 0) {
      statusMessage = "Paid exact amount (Ksh 25,000)";
      badgeClass = "bg-success";
    } else if (difference < 0) {
      statusMessage = `Underpayment by Ksh ${Math.abs(
        difference
      ).toLocaleString()}`;
      badgeClass = "bg-warning";
    } else {
      statusMessage = `Overpayment by Ksh ${difference.toLocaleString()}`;
      badgeClass = "bg-danger";
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card card-primary p-4 shadow rounded"
    >
      <h4 className="mb-3">Record Tenant Payment</h4>

      <div className="form-group mb-3">
        <label>Tenant</label>
        <select
          name="tenantId"
          className="form-control"
          value={form.tenantId}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Tenant --</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group mb-3">
        <label>Amount Paid</label>
        <input
          type="number"
          name="amount"
          className="form-control"
          value={form.amount}
          onChange={handleChange}
          required
        />
      </div>

      {paid > 0 && (
        <div className="mb-3">
          <p>
            Expected Rent: <strong>Ksh 25,000</strong>
          </p>
          <span className={`badge ${badgeClass} p-2`}>{statusMessage}</span>
        </div>
      )}

      <div className="form-group mb-3">
        <label>Date Paid</label>
        <input
          type="date"
          name="date"
          className="form-control"
          value={form.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group mb-4">
        <label>Notes (optional)</label>
        <input
          type="text"
          name="notes"
          className="form-control"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <button className="btn btn-primary">Submit Payment</button>
    </form>
  );
}
