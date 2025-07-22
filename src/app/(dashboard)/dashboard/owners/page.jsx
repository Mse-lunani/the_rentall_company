"use client";
import { useEffect, useState } from "react";
import OwnerTable from "./OwnerTable";
import ViewModal from "../components/ViewModal";

export default function OwnerListPage() {
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [owners, setOwners] = useState([]);

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/owners");
      const data = await res.json();
      console.log("Owners fetched:", data);
      setOwners(data || []);
    } catch (err) {
      console.error("Failed to fetch owners:", err);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this owner?"
    );
    if (!confirm) return;

    const res = await fetch(`/api/owners?id=${id}`, { method: "DELETE" });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "Delete failed");
      return;
    }
    alert("Owner deleted successfully");
    fetchOwners();
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1 className="mt-3">Owners</h1>
          <OwnerTable
            owners={owners}
            onView={setSelectedOwner}
            onDelete={handleDelete}
          />
        </div>
      </section>

      <ViewModal id="viewOwnerModal" title="Owner Details">
        {selectedOwner ? (
          <div>
            <p>
              <strong>Full Name:</strong> {selectedOwner.full_name}
            </p>
            <p>
              <strong>Phone:</strong> {selectedOwner.phone}
            </p>
            <p>
              <strong>Email:</strong> {selectedOwner.email}
            </p>
            <p>
              <strong>National ID:</strong> {selectedOwner.national_id || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {selectedOwner.address || "N/A"}
            </p>
            <p>
              <strong>Login Password:</strong>{" "}
              <code className="text-success">
                {selectedOwner.password_text || "****"}
              </code>
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(selectedOwner.created_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <p>No owner selected</p>
        )}
      </ViewModal>
    </div>
  );
}