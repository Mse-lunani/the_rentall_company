"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MoveTenantPage({ params }) {
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    new_unit_id: '',
    move_date: new Date().toISOString().split('T')[0],
    new_monthly_rent: '',
    new_deposit_paid: '',
    move_reason: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      const tenantId = resolvedParams.id;

      try {
        // Fetch tenant details
        const tenantRes = await fetch(`/api/owner/tenants?id=${tenantId}&include_history=true`);
        const tenantData = await tenantRes.json();

        if (tenantRes.ok) {
          setTenant(tenantData);
        }

        // Fetch available units
        const unitsRes = await fetch('/api/owner/units');
        const unitsData = await unitsRes.json();
        
        if (unitsRes.ok) {
          // Filter out occupied units
          const available = unitsData.filter(unit => !unit.is_occupied);
          setAvailableUnits(available);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.new_unit_id) {
      alert("Please select a new unit");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/owner/tenants/${tenant.id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (res.ok) {
        alert("Tenant moved successfully!");
        router.push(`/owner_dashboard/tenancies/tenant/${tenant.id}`);
      } else {
        alert("Failed to move tenant: " + result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      alert("Failed to move tenant: " + err.message);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Tenant not found</p>
            <Link href="/dashboard/tenants" className="btn btn-secondary">Back to Tenants</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Move Tenant: {tenant.full_name}</h1>
              <p className="text-muted mb-0">
                Current Unit: {tenant.unit_name || tenant.legacy_unit_name} 
                ({tenant.building_name || tenant.legacy_building_name})
              </p>
            </div>
            <div>
              <Link href="/dashboard/tenants" className="btn btn-secondary me-2">
                Back to Tenants
              </Link>
              <Link href={`/dashboard/tenancies/tenant/${tenant.id}`} className="btn btn-info">
                View History
              </Link>
            </div>
          </div>

          <div className="row">
            {/* Current Tenancy Info */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Current Tenancy</h5>
                </div>
                <div className="card-body">
                  <p><strong>Unit:</strong> {tenant.unit_name || tenant.legacy_unit_name}</p>
                  <p><strong>Building:</strong> {tenant.building_name || tenant.legacy_building_name}</p>
                  <p><strong>Current Rent:</strong> KES {tenant.tenancy_rent ? Number(tenant.tenancy_rent).toLocaleString() : 'N/A'}</p>
                  {tenant.start_date && (
                    <p><strong>Start Date:</strong> {new Date(tenant.start_date).toLocaleDateString()}</p>
                  )}
                  {tenant.deposit_paid && (
                    <p><strong>Deposit:</strong> KES {Number(tenant.deposit_paid).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Move Form */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Move to New Unit</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="new_unit_id" className="form-label">New Unit *</label>
                        <select
                          id="new_unit_id"
                          name="new_unit_id"
                          className="form-select"
                          value={formData.new_unit_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select a unit...</option>
                          {availableUnits.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} - {unit.building_name} (KES {Number(unit.rent_amount_kes).toLocaleString()})
                            </option>
                          ))}
                        </select>
                        <small className="text-muted">Only available units are shown</small>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="move_date" className="form-label">Move Date *</label>
                        <input
                          type="date"
                          id="move_date"
                          name="move_date"
                          className="form-control"
                          value={formData.move_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="new_monthly_rent" className="form-label">New Monthly Rent</label>
                        <input
                          type="number"
                          id="new_monthly_rent"
                          name="new_monthly_rent"
                          className="form-control"
                          placeholder="Leave empty to use unit default"
                          value={formData.new_monthly_rent}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="new_deposit_paid" className="form-label">New Deposit Amount</label>
                        <input
                          type="number"
                          id="new_deposit_paid"
                          name="new_deposit_paid"
                          className="form-control"
                          placeholder="Leave empty for no deposit"
                          value={formData.new_deposit_paid}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="move_reason" className="form-label">Reason for Move</label>
                      <select
                        id="move_reason"
                        name="move_reason"
                        className="form-select"
                        value={formData.move_reason}
                        onChange={handleInputChange}
                      >
                        <option value="">Select reason...</option>
                        <option value="upgrade">Upgrade to larger unit</option>
                        <option value="downgrade">Downgrade to smaller unit</option>
                        <option value="maintenance">Unit maintenance required</option>
                        <option value="tenant-request">Tenant requested move</option>
                        <option value="rent-adjustment">Rent adjustment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">Additional Notes</label>
                      <textarea
                        id="notes"
                        name="notes"
                        className="form-control"
                        rows="3"
                        placeholder="Any additional notes about this move..."
                        value={formData.notes}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="d-flex justify-content-end">
                      <Link href="/owner_dashboard/tenants" className="btn btn-secondary me-2">
                        Cancel
                      </Link>
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Moving...' : 'Move Tenant'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {availableUnits.length === 0 && (
            <div className="alert alert-warning mt-3">
              <strong>No Available Units:</strong> There are no available units for this tenant to move to. 
              Please ensure there are vacant units before attempting to move a tenant.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}