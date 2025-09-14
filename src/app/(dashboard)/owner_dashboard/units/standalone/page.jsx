"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StandaloneUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandaloneUnits();
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

  const fetchStandaloneUnits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/property-records?unit_type=standalone&include_occupied=true");
      const data = await res.json();
      setUnits(data.units || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch standalone units:", err);
    }
  };

  const handleDeleteUnit = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this unit?");
    if (!confirm) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/units?id=${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Delete failed");
        return;
      }

      alert("Unit deleted successfully");
      fetchStandaloneUnits(); // Refresh the list
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Standalone Units</h1>
              <p className="text-muted mb-0">Units that are not part of any building</p>
            </div>
            <div>
              <Link href="/dashboard/units" className="btn btn-outline-primary me-2">
                All Units
              </Link>
              <Link href="/dashboard/property_entry" className="btn btn-primary">
                Add Standalone Unit
              </Link>
            </div>
          </div>

          {/* Info Alert */}
          <div className="alert alert-info mb-4">
            <h6 className="alert-heading mb-2">What are Standalone Units?</h6>
            <p className="mb-0">
              These are individual units that operate independently and are not part of a larger building complex. 
              They could be individual houses, apartments, or commercial spaces that are managed separately.
            </p>
          </div>

          {/* Standalone Units Table */}
          <div className="card">
            <div className="card-body table-responsive">
              {loading ? (
                <div className="text-center py-4">
                  <p>Loading standalone units...</p>
                </div>
              ) : (
                <table className="table table-bordered table-striped datatables-basic" data-name="Standalone Units">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Unit Name</th>
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
                        <td>{index + 1}</td>
                        <td>
                          <div>
                            <strong>{unit.name}</strong>
                            <small className="d-block text-muted">Standalone Unit</small>
                          </div>
                        </td>
                        <td>
                          {unit.owner_name ? (
                            <Link href={`/dashboard/owners/${unit.owner_id}`} className="text-primary">
                              {unit.owner_name}
                            </Link>
                          ) : (
                            <span className="text-muted">Unassigned</span>
                          )}
                        </td>
                        <td>{unit.bedrooms || "N/A"}</td>
                        <td>{unit.bathrooms || "N/A"}</td>
                        <td>
                          <strong>Ksh {unit.rent_amount_kes?.toLocaleString() || "N/A"}</strong>
                        </td>
                        <td>
                          <span className={`badge badge-${unit.is_occupied ? 'danger' : 'success'}`}>
                            {unit.is_occupied ? 'Occupied' : 'Available'}
                          </span>
                        </td>
                        <td>
                          {unit.tenant_name ? (
                            <Link href={`/dashboard/tenants/${unit.tenant_id}`} className="text-primary">
                              {unit.tenant_name}
                            </Link>
                          ) : (
                            <span className="text-muted">Vacant</span>
                          )}
                        </td>
                        <td>
                          <Link
                            href={`/dashboard/property_records/units/edit/${unit.id}`}
                            className="btn btn-warning btn-sm me-1"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUnit(unit.id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loading && units.length === 0 && (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <i className="bx bx-home-alt display-1 text-muted"></i>
                  </div>
                  <h5>No Standalone Units Found</h5>
                  <p className="text-muted mb-3">
                    You haven't added any standalone units yet. Create your first standalone unit to get started.
                  </p>
                  <Link href="/dashboard/property_entry" className="btn btn-primary">
                    Add First Standalone Unit
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {!loading && units.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h3 className="text-primary">{units.length}</h3>
                    <p className="text-muted mb-0">Total Standalone</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h3 className="text-success">{units.filter(u => !u.is_occupied).length}</h3>
                    <p className="text-muted mb-0">Available</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h3 className="text-danger">{units.filter(u => u.is_occupied).length}</h3>
                    <p className="text-muted mb-0">Occupied</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h3 className="text-info">
                      Ksh {units.reduce((sum, unit) => sum + (unit.rent_amount_kes || 0), 0).toLocaleString()}
                    </h3>
                    <p className="text-muted mb-0">Total Rent Potential</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}