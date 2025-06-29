"use client";
import { useState } from "react";

export default function TenantForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    unit: "",
  });

  const units = [
    { id: "U001", name: "Unit A1 - Sunset Apartments" },
    { id: "U002", name: "Unit B2 - Hillview Flats" },
    { id: "U003", name: "Unit C3 - Lakeview Villas" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card card-primary">
      <div className="card-header">
        <h3 className="card-title">Tenant Information</h3>
      </div>
      <form>
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
              placeholder="Enter full name"
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
              placeholder="e.g. 0712345678"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address (optional)</label>
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
          <button type="submit" className="btn btn-primary" disabled>
            Submit (Disabled for now)
          </button>
        </div>
      </form>
    </div>
  );
}
