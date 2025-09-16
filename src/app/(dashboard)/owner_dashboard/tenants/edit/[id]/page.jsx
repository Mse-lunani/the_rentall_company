"use client";
import { useEffect, useState } from "react";
import TenantEditForm from "./TenantEditForm";

export default function EditTenantPage({ params }) {
  const fetchTenant = async (id) => {
    try {
      const res = await fetch(`/api/owner/tenants?id=${id}`);
      const data = await res.json();
      console.log("Fetched Tenant Data:", data);
      return data;
    } catch (err) {
      console.error("Failed to fetch tenant:", err);
      return null;
    }
  };
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      const data = await fetchTenant(resolvedParams.id);
      setTenant(data);
    };
    fetchData();
  }, [params]);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1 className="mt-3">Edit Tenant</h1>
          <TenantEditForm initialData={tenant} />
        </div>
      </section>
    </div>
  );
}
