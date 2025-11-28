"use client";
import { useState, useEffect } from "react";

export default function PaymentTypeForm() {
  const [form, setForm] = useState({
    name: "",
    type: "dynamic",
    amount: "",
    owner_id: "",
  });
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/owners");
      if (res.ok) {
        const data = await res.json();
        setOwners(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch owners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      type: form.type || "dynamic",
      amount: form.amount ? parseFloat(form.amount) : null,
      owner_id: form.owner_id ? parseInt(form.owner_id) : null,
    };

    try {
      const res = await fetch("/api/payment_types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Payment type created successfully");
        setForm({ name: "", type: "dynamic", amount: "", owner_id: "" });
      } else {
        alert(data.error || "Failed to create payment type");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create payment type");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow rounded">
      <h4 className="mb-3">Create Payment Type</h4>

      <div className="form-group mb-3">
        <label>Name *</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group mb-3">
        <label>Type</label>
        <select
          name="type"
          className="form-control"
          value={form.type}
          onChange={handleChange}
        >
          <option value="dynamic">dynamic</option>
          <option value="fixed">fixed</option>
        </select>
      </div>

      <div className="form-group mb-3">
        <label>Amount (optional, used for fixed types)</label>
        <input
          type="number"
          name="amount"
          className="form-control"
          value={form.amount}
          onChange={handleChange}
        />
      </div>

      <div className="form-group mb-4">
        <label>Owner (optional)</label>
        <select
          name="owner_id"
          className="form-control"
          value={form.owner_id}
          onChange={handleChange}
        >
          <option value="">-- Leave blank --</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.full_name} ({o.phone})
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary" disabled={loading || isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Payment Type"}
      </button>
    </form>
  );
}
