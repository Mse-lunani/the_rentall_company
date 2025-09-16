"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AllUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUnits();
  }, []);

  // Initialize DataTable after units load
  useEffect(() => {
    if (!loading && units.length > 0) {
      setTimeout(() => {
        if (window.initDataTable) {
          window.initDataTable();
        }
      }, 100);
    }
  }, [loading, units]);

  const fetchAllUnits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/units");
      const data = await res.json();
      setUnits(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch units:", err);
    }
  };

  const handleDeleteUnit = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this unit?");
    if (!confirm) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/owner/units?id=${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Delete failed");
        return;
      }

      alert("Unit deleted successfully");
      fetchAllUnits(); // Refresh the list
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h1>All Units</h1>
              <p className="text-muted mb-0">Complete list of all units in the system</p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <Link href="/owner_dashboard/units/standalone" className="btn btn-outline-primary">
                <i className="bx bx-building-house me-1"></i>
                <span className="d-none d-sm-inline">Standalone Units</span>
                <span className="d-inline d-sm-none">Standalone</span>
              </Link>
              <Link href="/owner_dashboard/property_entry" className="btn btn-primary">
                <i className="bx bx-plus me-1"></i>
                <span className="d-none d-sm-inline text-white">Add New Unit</span>
                <span className="d-inline d-sm-none text-white">Add Unit</span>
              </Link>
            </div>
          </div>

          {/* Units Table */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
              {loading ? (
                <div className="text-center py-4">
                  <p>Loading units...</p>
                </div>
              ) : (
                <table className="table table-bordered table-striped datatables-basic" data-name="All Units">
                  <thead>
                    <tr>
                      <th style={{width: '15px'}}></th>
                      <th>Unit Name</th>
                      <th>Building</th>
                      <th>Owner</th>
                      <th>Bedrooms</th>
                      <th>Bathrooms</th>
                      <th>Rent (KES)</th>
                      <th>Status</th>
                      <th>Tenant</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit, index) => (
                      <tr key={unit.id}>
                        <td></td>
                        <td><strong>{unit.name}</strong></td>
                        <td>
                          {unit.building_name === 'Standalone' ? (
                            <span className="badge badge-secondary">Standalone</span>
                          ) : (
                            <Link
                              href={`/owner_dashboard/property_records/buildings/${unit.building_id}`}
                              className="text-primary"
                            >
                              {unit.building_name}
                            </Link>
                          )}
                        </td>
                        <td>
                          {unit.owner_name ? (
                            <span className="text-primary">
                              {unit.owner_name}
                            </span>
                          ) : (
                            <span className="text-muted">Unassigned</span>
                          )}
                        </td>
                        <td>{unit.bedrooms || "N/A"}</td>
                        <td>{unit.bathrooms || "N/A"}</td>
                        <td><strong>Ksh {unit.rent_amount_kes?.toLocaleString() || "N/A"}</strong></td>
                        <td>
                          <span className={`badge bg-dark text-white`}>
                            {unit.is_occupied ? 'Occupied' : 'Available'}
                          </span>
                        </td>
                        <td>
                          {unit.tenant_name ? (
                            <Link href={`/owner_dashboard/tenants/${unit.tenant_id}`} className="text-primary">
                              {unit.tenant_name}
                            </Link>
                          ) : (
                            <span className="text-muted">Vacant</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Link
                              href={`/owner_dashboard/property_records/units/edit/${unit.id}`}
                              className="btn btn-warning btn-sm"
                              title="Edit Unit"
                            >
                              <i className="bx bx-edit"></i>
                            </Link>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUnit(unit.id)}
                              disabled={loading}
                              title="Delete Unit"
                            >
                              <i className="bx bx-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loading && units.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">No units found.</p>
                  <Link href="/owner_dashboard/property_entry" className="btn btn-primary">
                    Add First Unit
                  </Link>
                </div>
              )}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}