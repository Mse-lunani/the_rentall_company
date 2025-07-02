"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TenantForm({ initialData = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    unit: "",
  });

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/property-records")
      .then((res) => res.json())
      .then((data) => {
        setUnits(data.units || []);
        setLoading(false);
      });

    if (initialData) {
      setFormData({
        fullName: initialData.full_name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        unit: initialData.unit_id || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      full_name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      unit_id: formData.unit,
    };

    const url = initialData
      ? `/api/tenants?id=${initialData.id}`
      : `/api/tenants`;

    const method = initialData ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      alert(`Tenant ${initialData ? "updated" : "added"} successfully`);
      router.push("/dashboard/tenants");
      if (!initialData) {
        setFormData({ fullName: "", phone: "", email: "", unit: "" });
      }
    } else {
      alert(result.error || "Something went wrong");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="card card-primary">
      <div className="card-header">
        <h3 className="card-title">{initialData ? "Edit" : "Add"} Tenant</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. tenant@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Assigned Unit</label>
            <select
              className="form-control"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              <option value="">Select a unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-footer">
          <button
            type="submit"
            className="mt-3 btn btn-primary"
            disabled={loading || isSubmitting}
          >
            {initialData ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
