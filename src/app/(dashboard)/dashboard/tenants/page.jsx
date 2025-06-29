"use client";
import { useState } from "react";
import TenantTable from "./TenantTable";
import ViewModal from "../components/ViewModal";

export default function TenantListPage() {
  const [selectedTenant, setSelectedTenant] = useState(null);

  const tenants = [
    {
      id: 1,
      fullName: "John Mwangi",
      phone: "0712345678",
      email: "john@example.com",
      unit: "Unit A1 - Sunset Apartments",
      status: "Active",
    },
    {
      id: 2,
      fullName: "Mary Atieno",
      phone: "0798765432",
      email: "",
      unit: "Unit B2 - Hillview Flats",
      status: "Inactive",
    },
    {
      id: 3,
      fullName: "Ali Hassan",
      phone: "0722000000",
      email: "ali@lakeview.com",
      unit: "Unit C3 - Lakeview Villas",
      status: "Active",
    },
  ];

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1 className="mt-3">Tenants</h1>
          <TenantTable tenants={tenants} onView={setSelectedTenant} />
        </div>
      </section>

      <ViewModal id="viewTenantModal" title="Tenant Details">
        {selectedTenant ? (
          <div>
            <p>
              <strong>Full Name:</strong> {selectedTenant.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {selectedTenant.phone}
            </p>
            <p>
              <strong>Email:</strong> {selectedTenant.email || "N/A"}
            </p>
            <p>
              <strong>Unit:</strong> {selectedTenant.unit}
            </p>
            <p>
              <strong>Status:</strong> {selectedTenant.status}
            </p>
          </div>
        ) : (
          <p>No tenant selected</p>
        )}
      </ViewModal>
    </div>
  );
}
