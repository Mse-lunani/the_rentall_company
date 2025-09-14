"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SingleBuildingPage({ params }) {
  const router = useRouter();
  const [building, setBuilding] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      const buildingId = resolvedParams.id;

      try {
        // Fetch building data and its units
        const res = await fetch(
          `/api/owner/property-records?unit_type=building&building_id=${buildingId}&include_occupied=true`
        );
        const data = await res.json();

        // Find the specific building
        const buildingData = data.buildings.find(
          (b) => b.id.toString() === buildingId.toString()
        );
        setBuilding(buildingData);

        setUnits(data.units || []);
        console.log("Units:", data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch building data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

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

  const handleDeleteUnit = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this unit?"
    );
    if (!confirm) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/owner/units?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Delete failed");
        return;
      }

      alert("Unit deleted successfully");
      // Refresh the data
      window.location.reload();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Loading building details...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Building not found</p>
            <Link
              href="/owner_dashboard/property_records"
              className="btn btn-secondary"
            >
              Back to Buildings
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          {/* Header with Building Info */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Building: {building.name}</h1>
              <p className="text-muted mb-0">
                {building.type} • {building.units_owned} units •{" "}
                {building.total_space_sqm} sqm
                {building.owner_name && (
                  <>
                    {" • Owner: "}
                    <span className="text-primary">{building.owner_name}</span>
                  </>
                )}
              </p>
            </div>
            <div>
              <Link
                href="/owner_dashboard/property_records"
                className="btn btn-secondary me-2"
              >
                Back to Buildings
              </Link>
              <Link
                href={`/owner_dashboard/property_entry/`}
                className="btn btn-primary"
              >
                Add Unit
              </Link>
            </div>
          </div>

          {/* Building Details Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Building Information</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Name:</strong> {building.name}
                  </p>
                  <p>
                    <strong>Type:</strong> {building.type}
                  </p>
                  <p>
                    <strong>Total Units:</strong> {building.units_owned}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Total Space:</strong> {building.total_space_sqm} sqm
                  </p>
                  <p>
                    <strong>Occupancy Status:</strong>
                    <span
                      className={`badge ms-2 badge-${
                        building.occupancy_status === "Fully Occupied"
                          ? "success"
                          : building.occupancy_status === "Partially Occupied"
                          ? "warning"
                          : "danger"
                      }`}
                    >
                      {building.occupancy_status}
                    </span>
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(building.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Units Table */}
          <div className="card">
            <div className="card-body table-responsive">
              <table
                className="table table-bordered table-striped datatables-basic"
                data-name={`Units in ${building.name}`}
              >
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
                      <td>{unit.name}</td>
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
                      <td>
                        Ksh {unit.rent_amount_kes?.toLocaleString() || "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge badge-${
                            unit.is_occupied ? "danger" : "success"
                          }`}
                        >
                          {unit.is_occupied ? "Occupied" : "Available"}
                        </span>
                      </td>
                      <td>
                        {unit.tenant_name ? (
                          <Link
                            href={`/owner_dashboard/tenants/${unit.tenant_id}`}
                            className="text-primary"
                          >
                            {unit.tenant_name}
                          </Link>
                        ) : (
                          <span className="text-muted">Vacant</span>
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/owner_dashboard/property_records/units/edit/${unit.id}`}
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
              {units.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">
                    No units found in this building.
                  </p>
                  <Link
                    href={`/owner_dashboard/property_entry/units/add?building_id=${building.id}`}
                    className="btn btn-primary"
                  >
                    Add First Unit
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
