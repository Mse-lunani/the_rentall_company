"use client";
import { useState, useEffect } from "react";

export default function PaymentForm() {
  const [form, setForm] = useState({
    tenantId: "",
    amount: "",
    date: new Date().toISOString().substring(0, 10),
    notes: "",
  });

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTenancy, setCurrentTenancy] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);
  const fetchTenants = async () => {
    const res = await fetch("/api/tenants");
    const data = await res.json();
    setTenants(data || []);
    setLoading(false);
  };

  const fetchCurrentTenancy = async (tenantId) => {
    try {
      const res = await fetch(`/api/tenancies/tenant/${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        const activeTenancies = data.tenancy_history?.filter(t => t.occupancy_status === 'active') || [];
        setCurrentTenancy(activeTenancies.length > 0 ? activeTenancies[0] : null);
      }
    } catch (error) {
      console.error("Failed to fetch tenancy info:", error);
      setCurrentTenancy(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "tenantId") {
      const tenant = tenants.find((t) => t.id === parseInt(value));
      setSelectedTenant(tenant || null);
      
      if (tenant) {
        fetchCurrentTenancy(tenant.id);
      } else {
        setCurrentTenancy(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: form.tenantId,
        amount_paid: parseFloat(form.amount),
        date_paid: form.date,
        notes: form.notes,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Payment recorded successfully");
      setForm({
        tenantId: "",
        amount: "",
        date: new Date().toISOString().substring(0, 10),
        notes: "",
      });
      setSelectedTenant(null);
    } else {
      alert(result.error || "Failed to record payment");
    }
  };

  const paid = parseFloat(form.amount || 0);
  const rent = currentTenancy?.monthly_rent || selectedTenant?.tenancy_rent || selectedTenant?.rent_amount_kes || 0;
  const difference = paid - rent;

  let statusMessage = "";
  let badgeClass = "";

  if (paid > 0 && selectedTenant) {
    if (difference === 0) {
      statusMessage = `Paid exact rent (Ksh ${rent.toLocaleString()})`;
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
              {t.full_name}
            </option>
          ))}
        </select>
      </div>

      {selectedTenant && (
        <div className="mb-2">
          {currentTenancy ? (
            <div className="card bg-light">
              <div className="card-body p-3">
                <h6 className="card-title text-success">Current Active Tenancy</h6>
                <p className="mb-1">
                  <strong>Unit:</strong> {currentTenancy.unit_name}
                  <br />
                  <strong>Building:</strong> {currentTenancy.building_name}
                  <br />
                  <strong>Monthly Rent:</strong> Ksh {Number(currentTenancy.monthly_rent).toLocaleString()}
                  <br />
                  <strong>Start Date:</strong> {new Date(currentTenancy.start_date).toLocaleDateString()}
                  <br />
                  <small className="text-muted">Duration: {currentTenancy.duration_days} days</small>
                </p>
              </div>
            </div>
          ) : selectedTenant.tenancy_status === 'HAS_ACTIVE_TENANCY' ? (
            <div className="alert alert-info">
              <strong>Unit:</strong> {selectedTenant.unit_name || "N/A"}
              <br />
              <strong>Expected Rent:</strong> Ksh {rent.toLocaleString()}
            </div>
          ) : (
            <div className="alert alert-warning">
              <strong>No Active Tenancy:</strong> This tenant doesn't have an active unit assignment.
              <br />
              <small>Payment will be recorded but not linked to a specific tenancy.</small>
            </div>
          )}
        </div>
      )}

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

      {statusMessage && (
        <div className="mb-3">
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

      <button className="btn btn-primary" disabled={loading}>
        Submit Payment
      </button>
    </form>
  );
}
