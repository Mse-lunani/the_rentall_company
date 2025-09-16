"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TenantUnitSelect from "../../components/TenantUnitSelect";

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
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [showOccupiedUnits, setShowOccupiedUnits] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (showOccupiedUnits) {
      params.append("include_occupied", "true");
    }
    if (initialData?.id) {
      params.append("current_tenant_id", initialData.id);
    }

    const queryString = params.toString();
    const url = `/api/property-records${queryString ? `?${queryString}` : ""}`;

    fetch(url)
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
      setGeneratedPassword(initialData.password_text || null);
    }
  }, [initialData]);

  // Refetch units when showOccupiedUnits changes
  useEffect(() => {
    if (!loading) {
      setLoading(true);
      const params = new URLSearchParams();
      if (showOccupiedUnits) {
        params.append("include_occupied", "true");
      }
      if (initialData?.id) {
        params.append("current_tenant_id", initialData.id);
      }

      const queryString = params.toString();
      const url = `/api/property-records${
        queryString ? `?${queryString}` : ""
      }`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setUnits(data.units || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [showOccupiedUnits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegeneratePassword = async () => {
    if (!initialData) return;

    const res = await fetch(`/api/tenants?id=${initialData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerate_password: true }),
    });

    const result = await res.json();
    if (res.ok) {
      setGeneratedPassword(result.password);
      alert(`New password generated: ${result.password}`);
    } else {
      alert(result.error || "Failed to regenerate password");
    }
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
      if (!initialData && result.password) {
        setGeneratedPassword(result.password);
        alert(
          `Tenant added successfully! Generated password: ${result.password}`
        );
      } else {
        alert(`Tenant ${initialData ? "updated" : "added"} successfully`);
      }
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
            <div className="mb-2">
              <button
                type="button"
                className={`btn btn-sm ${
                  showOccupiedUnits ? "btn-warning" : "btn-outline-secondary"
                }`}
                onClick={() => setShowOccupiedUnits(!showOccupiedUnits)}
              >
                {showOccupiedUnits
                  ? "Hide Occupied Units"
                  : "Show Occupied Units Too"}
              </button>
              <small className="text-muted ml-3">
                {showOccupiedUnits
                  ? "Showing all units"
                  : "Showing available units only"}
              </small>
            </div>
            {loading ? (
              <div className="form-control d-flex align-items-center">
                <span>Loading units...</span>
              </div>
            ) : (
              <TenantUnitSelect
                units={units}
                value={formData.unit}
                onChange={handleChange}
                required={true}
                placeholder="Select a unit"
                id="unit"
              />
            )}
          </div>

          {/* Password Display Section */}
          {(generatedPassword || initialData) && (
            <div className="form-group">
              <label>Login Password</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control font-weight-bold"
                  value={generatedPassword || "****"}
                  readOnly
                  style={{
                    fontFamily: "monospace",
                    backgroundColor: "#f8f9fa",
                    border: "2px solid #28a745",
                  }}
                />
                {initialData && (
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={handleRegeneratePassword}
                      style={{ marginLeft: "10px" }}
                    >
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
              <small className="text-muted">
                This password will be used for tenant login access.
              </small>
            </div>
          )}
        </div>
        <div className="card-footer">
          <button
            type="submit"
            className="mt-3 btn btn-primary"
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? (initialData ? "Updating..." : "Submitting...") : (initialData ? "Update" : "Submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
