"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OwnerForm({ initialData = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    nationalId: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  useState(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.full_name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        nationalId: initialData.national_id || "",
        address: initialData.address || "",
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
      national_id: formData.nationalId,
      address: formData.address,
    };

    const url = initialData
      ? `/api/owners?id=${initialData.id}`
      : `/api/owners`;

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
        alert(`Owner added successfully! Generated password: ${result.password}`);
      } else {
        alert(`Owner ${initialData ? "updated" : "added"} successfully`);
      }
      router.push("/dashboard/owners");
      if (!initialData) {
        setFormData({ fullName: "", phone: "", email: "", nationalId: "", address: "" });
      }
    } else {
      alert(result.error || "Something went wrong");
    }

    setIsSubmitting(false);
  };

  const handleRegeneratePassword = async () => {
    if (!initialData) return;
    
    const res = await fetch(`/api/owners?id=${initialData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerate_password: true }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Password regenerated successfully!");
      router.refresh();
    } else {
      alert(result.error || "Failed to regenerate password");
    }
  };

  return (
    <div className="card card-primary">
      <div className="card-header">
        <h3 className="card-title">{initialData ? "Edit" : "Add"} Owner</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
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
            <label htmlFor="phone">Phone Number *</label>
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
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. owner@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nationalId">National ID</label>
            <input
              type="text"
              className="form-control"
              id="nationalId"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              placeholder="e.g. 12345678"
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              className="form-control"
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
            />
          </div>
          
          {initialData && (
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={initialData.password_text || "****"}
                  readOnly
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleRegeneratePassword}
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {generatedPassword && (
            <div className="alert alert-success">
              <strong>Generated Password:</strong> {generatedPassword}
              <br />
              <small>Please save this password. It will not be shown again.</small>
            </div>
          )}
        </div>
        <div className="card-footer">
          <button
            type="submit"
            className="mt-3 btn btn-primary"
            disabled={isSubmitting}
          >
            {initialData ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}