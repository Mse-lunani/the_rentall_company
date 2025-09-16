"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentForm({ initialData = null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    tenantId: "",
    amount: "",
    date: new Date().toISOString().substring(0, 10),
    notes: "",
  });

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/tenants")
      .then((res) => res.json())
      .then((data) => {
        setTenants(data || []);
      });
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        tenantId: initialData.tenant_id,
        amount: initialData.amount_paid,
        date: initialData.date_paid.substring(0, 10),
        notes: initialData.notes || "",
      });

      const t = tenants.find((t) => t.id === initialData.tenant_id);
      setSelectedTenant(t || null);
    }
  }, [initialData, tenants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "tenantId") {
      const t = tenants.find((t) => t.id === parseInt(value));
      setSelectedTenant(t || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      tenant_id: form.tenantId,
      amount_paid: parseFloat(form.amount),
      date_paid: form.date,
      notes: form.notes,
    };

    const method = initialData ? "PATCH" : "POST";
    const url = initialData
      ? `/api/payments?id=${initialData.id}`
      : "/api/payments";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      alert(`Payment ${initialData ? "updated" : "added"} successfully`);
      router.push("/dashboard/payments");
    } else {
      alert(result.error || "Failed");
    }
    setIsSubmitting(false);
  };

  const paid = parseFloat(form.amount || 0);
  const rent = selectedTenant?.rent_amount_kes || 0;
  const diff = paid - rent;

  let badge = "",
    msg = "";
  if (paid > 0 && rent) {
    if (diff === 0) {
      badge = "bg-success";
      msg = `Paid exact (Ksh ${rent})`;
    } else if (diff < 0) {
      badge = "bg-warning";
      msg = `Underpaid by Ksh ${Math.abs(diff)}`;
    } else {
      badge = "bg-danger";
      msg = `Overpaid by Ksh ${diff}`;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card card-primary p-4 shadow rounded"
    >
      <h4 className="mb-3">{initialData ? "Edit Payment" : "Add Payment"}</h4>

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

      {msg && <span className={`badge ${badge} mb-3 p-2`}>{msg}</span>}

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
        <label>Notes</label>
        <input
          type="text"
          name="notes"
          className="form-control"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <button className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? (initialData ? 'Updating...' : 'Submitting...') : (initialData ? "Update" : "Submit")}
      </button>
    </form>
  );
}
