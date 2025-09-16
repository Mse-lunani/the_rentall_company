"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TenantTable from "./TenantTable";
import ViewModal from "../components/ViewModal";

export default function TenantListPage() {
  const [selectedTenant, setSelectedTenant] = useState(null);

  //get tenants from api/tenants
  const [tenants, setTenants] = useState([]);
  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/owner/tenants");
      const data = await res.json();
      console.log("Tenants fetched:", data);
      setTenants(data || []);
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    }
  };
  useEffect(() => {
    fetchTenants();
  }, []);
  const handleDelete = async (id) => {
    // Confirm deletion
    const confirm = window.confirm(
      "Are you sure you want to delete this tenant?"
    );
    if (!confirm) return;
    // Perform delete request
    const res = await fetch(`/api/owner/tenants?id=${id}`, { method: "DELETE" });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "Delete failed");
      return;
    }
    alert("Tenant deleted successfully");
    fetchTenants();
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1 className="mt-3">Tenants</h1>
          <TenantTable
            tenants={tenants}
            onView={setSelectedTenant}
            onDelete={handleDelete}
          />
        </div>
      </section>

      <ViewModal id="viewTenantModal" title="Tenant Details">
        {selectedTenant ? (
          <div>
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-primary">Personal Information</h6>
                <p><strong>Full Name:</strong> {selectedTenant.full_name}</p>
                <p><strong>Phone:</strong> {selectedTenant.phone}</p>
                <p><strong>Email:</strong> {selectedTenant.email || "N/A"}</p>
                <p><strong>Created:</strong> {selectedTenant.created_at ? new Date(selectedTenant.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="col-md-6">
                <h6 className="text-primary">Current Tenancy</h6>
                {selectedTenant.tenancy_status === 'HAS_ACTIVE_TENANCY' ? (
                  <>
                    <p><strong>Unit:</strong> {selectedTenant.unit_name}</p>
                    <p><strong>Building:</strong> {selectedTenant.building_name}</p>
                    <p><strong>Monthly Rent:</strong> KES {selectedTenant.tenancy_rent ? Number(selectedTenant.tenancy_rent).toLocaleString() : 'N/A'}</p>
                    <p><strong>Start Date:</strong> {selectedTenant.start_date ? new Date(selectedTenant.start_date).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Duration:</strong> {selectedTenant.start_date ? Math.floor((Date.now() - new Date(selectedTenant.start_date)) / (1000 * 60 * 60 * 24)) : 0} days</p>
                    {selectedTenant.deposit_paid && (
                      <p><strong>Deposit:</strong> KES {Number(selectedTenant.deposit_paid).toLocaleString()}</p>
                    )}
                  </>
                ) : selectedTenant.tenancy_status === 'LEGACY_ONLY' ? (
                  <>
                    <p><strong>Unit (Legacy):</strong> {selectedTenant.legacy_unit_name}</p>
                    <p><strong>Building (Legacy):</strong> {selectedTenant.legacy_building_name}</p>
                    <p><strong>Status:</strong> <span className="badge badge-warning">Legacy System</span></p>
                  </>
                ) : (
                  <p><strong>Status:</strong> <span className="badge badge-danger">No Active Tenancy</span></p>
                )}
              </div>
            </div>
            
            {selectedTenant.tenancy_notes && (
              <div className="mt-3">
                <h6 className="text-primary">Notes</h6>
                <p className="text-muted">{selectedTenant.tenancy_notes}</p>
              </div>
            )}

            <div className="mt-3">
              <h6 className="text-primary">Actions</h6>
              <div className="btn-group">
                {selectedTenant.tenancy_status === 'HAS_ACTIVE_TENANCY' && (
                  <>
                    <Link
                      href={`/owner_dashboard/tenancies/tenant/${selectedTenant.id}`}
                      className="btn btn-info btn-sm"
                    >
                      View Full History
                    </Link>
                    <Link
                      href={`/owner_dashboard/tenants/${selectedTenant.id}/move`}
                      className="btn btn-warning btn-sm"
                    >
                      Move Unit
                    </Link>
                  </>
                )}
                <Link
                  href={`/owner_dashboard/tenants/edit/${selectedTenant.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Edit Details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <p>No tenant selected</p>
        )}
      </ViewModal>
    </div>
  );
}
