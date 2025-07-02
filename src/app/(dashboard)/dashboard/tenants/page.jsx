"use client";
import { useEffect, useState } from "react";
import TenantTable from "./TenantTable";
import ViewModal from "../components/ViewModal";

export default function TenantListPage() {
  const [selectedTenant, setSelectedTenant] = useState(null);

  //get tenants from api/tenants
  const [tenants, setTenants] = useState([]);
  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/tenants");
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
    const res = await fetch(`/api/tenants?id=${id}`, { method: "DELETE" });
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
            <p>
              <strong>Full Name:</strong> {selectedTenant.full_name}
            </p>
            <p>
              <strong>Phone:</strong> {selectedTenant.phone}
            </p>
            <p>
              <strong>Email:</strong> {selectedTenant.email || "N/A"}
            </p>
            <p>
              <strong>Unit:</strong> {selectedTenant.unit_number}
            </p>
            <p>
              <strong>Building:</strong> {selectedTenant.building_name || "N/A"}
            </p>
          </div>
        ) : (
          <p>No tenant selected</p>
        )}
      </ViewModal>
    </div>
  );
}
