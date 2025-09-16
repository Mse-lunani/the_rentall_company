"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TenantEditForm({ initialData = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.full_name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
      });
      setGeneratedPassword(initialData.password_text || null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegeneratePassword = async () => {
    if (!initialData) return;

    try {
      const res = await fetch(`/api/owner/tenants?id=${initialData.id}`, {
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
    } catch (error) {
      console.error("Error regenerating password:", error);
      alert("Failed to regenerate password");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/owner/tenants?id=${initialData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update tenant");
      }

      alert("Tenant updated successfully!");
      router.push("/owner_dashboard/tenants");
    } catch (error) {
      console.error("Error updating tenant:", error);
      alert(error.message || "Failed to update tenant");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading tenant data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Edit Tenant Information</h4>
        <p className="card-text text-muted">
          Update basic tenant details. To change unit assignments, use the Tenant Assignment feature.
        </p>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Tenant Password</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={generatedPassword || "N/A"}
                    disabled
                    readOnly
                    style={{
                      fontFamily: "monospace",
                      backgroundColor: "#f8f9fa",
                      fontWeight: "bold"
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    onClick={handleRegeneratePassword}
                    disabled={isSubmitting || !initialData}
                    title="Generate new password"
                  >
                    <i className="bx bx-refresh"></i> Regenerate
                  </button>
                </div>
                <small className="text-muted">
                  This password is used for tenant login access
                </small>
              </div>
            </div>
          </div>


          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                "Update Tenant"
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => router.push("/owner_dashboard/tenants")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}