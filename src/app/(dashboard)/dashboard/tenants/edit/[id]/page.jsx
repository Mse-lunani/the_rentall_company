"use client";
import { useEffect, useState } from "react";
import TenantForm from "../../add/TenantForm";

export default function EditTenantPage({ params }) {
  const fetchTenants = async (id) => {
    try {
      const res = await fetch(`/api/tenants?id=${id}`);
      const data = await res.json();
      console.log("Fetched Tenant Data:", data);
      return data;
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    }
  };
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTenants(params.id);
      setTenant(data);
    };
    fetchData();
  }, []);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1 className="mt-3">Edit Tenant</h1>
          <TenantForm initialData={tenant} />
        </div>
      </section>
    </div>
  );
}
