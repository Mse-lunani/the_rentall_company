"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OwnerTenantAssignmentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    tenant_type: "new", // "new" or "existing"
    existing_tenant_id: "",
    full_name: "",
    phone: "",
    email: "",
    unit_id: "",
    start_date: new Date().toISOString().split("T")[0],
    monthly_rent: "",
    deposit_paid: "",
    lease_terms: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch owner's units
        const unitsRes = await fetch("/api/owner/units");
        if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          setUnits(unitsData || []);
        }

        // Fetch owner's tenants
        const tenantsRes = await fetch("/api/owner/tenants");
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json();
          setAvailableTenants(tenantsData || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "unit_id") {
      const unit = units.find((u) => u.id === parseInt(value));
      setSelectedUnit(unit || null);

      // Auto-fill rent amounts if unit is selected
      if (unit) {
        setForm((prev) => ({
          ...prev,
          monthly_rent: unit.rent_amount_kes || "",
          deposit_paid: unit.deposit_amount_kes || "",
        }));
      }
    }

    if (name === "existing_tenant_id") {
      const tenant = availableTenants.find((t) => t.id === parseInt(value));
      setSelectedTenant(tenant || null);

      // Auto-fill tenant info if existing tenant is selected
      if (tenant) {
        setForm((prev) => ({
          ...prev,
          full_name: tenant.full_name,
          phone: tenant.phone,
          email: tenant.email || "",
        }));
      } else {
        // Clear tenant info if no tenant selected
        setForm((prev) => ({
          ...prev,
          full_name: "",
          phone: "",
          email: "",
        }));
      }
    }

    if (name === "tenant_type") {
      // Reset tenant-related fields when switching type
      setForm((prev) => ({
        ...prev,
        existing_tenant_id: "",
        full_name: "",
        phone: "",
        email: "",
      }));
      setSelectedTenant(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Assigning tenant to unit...", form);

    // Prepare form data
    const formData = {
      tenant_type: form.tenant_type,
      existing_tenant_id:
        form.tenant_type === "existing"
          ? parseInt(form.existing_tenant_id)
          : null,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      unit_id: parseInt(form.unit_id),
      start_date: form.start_date,
      monthly_rent: parseFloat(form.monthly_rent) || null,
      deposit_paid: parseFloat(form.deposit_paid) || null,
      lease_terms: form.lease_terms,
      notes: form.notes,
    };

    try {
      const res = await fetch("/api/owner/tenant-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Failed to assign tenant:", result);
        alert("Error: " + (result.error || "Assignment failed"));
        return;
      }

      if (form.tenant_type === "new" && result.password) {
        alert(`Tenant assigned successfully! Password: ${result.password}`);
      } else {
        alert("Tenant assigned successfully!");
      }
      router.push("/owner_dashboard/tenants");
    } catch (err) {
      console.error("Network or server error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-5">Loading available units...</div>;

  if (units.length === 0) {
    return (
      <div className="content-wrapper">
        <section className="content">
          <div className="container-xxl flex-grow-1 container-p-y">
            <div className="alert alert-warning">
              <h4>No Available Units</h4>
              <p>
                You don't have any units available for tenant assignment.
              </p>
              <a href="/owner_dashboard/property_records" className="btn btn-primary">
                View Your Units
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h3>Assign Tenant to Unit</h3>

          <form onSubmit={handleSubmit}>
            {/* Tenant Type Selection */}
            <div className="card card-info mt-3 mb-3">
              <div className="card-header">
                <h3 className="card-title">Tenant Selection</h3>
              </div>
              <div className="card-body">
                <div className="form-group mb-3">
                  <label className="form-label">Choose Tenant Type</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tenant_type"
                        id="new_tenant"
                        value="new"
                        checked={form.tenant_type === "new"}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="new_tenant">
                        Create New Tenant
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tenant_type"
                        id="existing_tenant"
                        value="existing"
                        checked={form.tenant_type === "existing"}
                        onChange={handleChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="existing_tenant"
                      >
                        Use Existing Tenant ({availableTenants.length} total)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Existing Tenant Selection */}
                {form.tenant_type === "existing" && (
                  <div className="form-group mb-3">
                    <label>Select Existing Tenant *</label>
                    <select
                      name="existing_tenant_id"
                      className="form-control"
                      value={form.existing_tenant_id}
                      onChange={handleChange}
                      required={form.tenant_type === "existing"}
                    >
                      <option value="">-- Select Tenant --</option>
                      {availableTenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.full_name} - {tenant.phone}
                          {tenant.email && ` (${tenant.email})`}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Note: You can assign any of your tenants, including those with
                      existing tenancies (many-to-many relationship).
                    </small>
                  </div>
                )}

                {selectedTenant && (
                  <div className="alert alert-info">
                    <h6>Selected Tenant:</h6>
                    <p>
                      <strong>Name:</strong> {selectedTenant.full_name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedTenant.phone}
                    </p>
                    {selectedTenant.email && (
                      <p>
                        <strong>Email:</strong> {selectedTenant.email}
                      </p>
                    )}
                  </div>
                )}

                {selectedTenant &&
                  selectedTenant.tenancy_status === "HAS_ACTIVE_TENANCY" && (
                    <div className="alert alert-warning">
                      <p>
                        <strong>Warning:</strong> This tenant already has an
                        active tenancy. Assigning them to a new unit will result
                        in multiple active tenancies for this tenant.
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Tenant Information */}
            <div className="card card-primary mt-3 mb-3">
              <div className="card-header">
                <h3 className="card-title">
                  {form.tenant_type === "new"
                    ? "New Tenant Information"
                    : "Tenant Information"}
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        className="form-control"
                        value={form.full_name}
                        onChange={handleChange}
                        required={form.tenant_type === "new"}
                        disabled={form.tenant_type === "existing"}
                      />
                      {form.tenant_type === "existing" && (
                        <small className="text-muted">
                          Auto-filled from selected tenant
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Phone *</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={form.phone}
                        onChange={handleChange}
                        required={form.tenant_type === "new"}
                        disabled={form.tenant_type === "existing"}
                      />
                      {form.tenant_type === "existing" && (
                        <small className="text-muted">
                          Auto-filled from selected tenant
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group mb-3">
                      <label>Email (Optional)</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                        disabled={form.tenant_type === "existing"}
                      />
                      {form.tenant_type === "existing" && (
                        <small className="text-muted">
                          Auto-filled from selected tenant
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit Selection */}
            <div className="card card-info mt-3 mb-3">
              <div className="card-header">
                <h3 className="card-title">Unit Assignment</h3>
              </div>
              <div className="card-body">
                <div className="form-group mb-3">
                  <label>Select Your Unit *</label>
                  <select
                    name="unit_id"
                    className="form-control"
                    value={form.unit_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Unit --</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} - {unit.building_name || "Standalone"}
                        (KES{" "}
                        {Number(unit.rent_amount_kes || 0).toLocaleString()}
                        /month)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUnit && (
                  <div className="alert alert-info">
                    <h6>Selected Unit Details:</h6>
                    <p>
                      <strong>Unit:</strong> {selectedUnit.name}
                    </p>
                    <p>
                      <strong>Building:</strong>{" "}
                      {selectedUnit.building_name || "Standalone"}
                    </p>
                    <p>
                      <strong>Bedrooms:</strong> {selectedUnit.bedrooms}
                    </p>
                    <p>
                      <strong>Monthly Rent:</strong> KES{" "}
                      {Number(
                        selectedUnit.rent_amount_kes || 0
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Deposit:</strong> KES{" "}
                      {Number(
                        selectedUnit.deposit_amount_kes || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedUnit && selectedUnit.is_occupied && (
                  <div className="alert alert-warning">
                    <p>
                      <strong>Warning:</strong> This unit is already occupied.
                      Assigning a new tenant will result in multiple tenancies
                      for this unit.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tenancy Details */}
            <div className="card card-success mt-3 mb-3">
              <div className="card-header">
                <h3 className="card-title">Tenancy Details</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        name="start_date"
                        className="form-control"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label>Monthly Rent (KES)</label>
                      <input
                        type="number"
                        name="monthly_rent"
                        className="form-control"
                        value={form.monthly_rent}
                        onChange={handleChange}
                        step="0.01"
                      />
                      <small className="form-text text-muted">
                        Leave empty to use unit's default rent
                      </small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label>Deposit Paid (KES)</label>
                      <input
                        type="number"
                        name="deposit_paid"
                        className="form-control"
                        value={form.deposit_paid}
                        onChange={handleChange}
                        step="0.01"
                      />
                      <small className="form-text text-muted">
                        Leave empty to use unit's default deposit
                      </small>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Lease Terms (Optional)</label>
                      <textarea
                        name="lease_terms"
                        className="form-control"
                        value={form.lease_terms}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Enter lease terms, conditions, or contract details..."
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Notes (Optional)</label>
                      <textarea
                        name="notes"
                        className="form-control"
                        value={form.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Additional notes about the tenancy..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button type="submit" className="btn btn-primary me-2" disabled={isSubmitting}>
                {isSubmitting ? 'Assigning...' : 'Assign Tenant to Unit'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push("/owner_dashboard/tenants")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}