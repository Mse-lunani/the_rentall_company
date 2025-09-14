"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const ViewModal = dynamic(() => import("./ViewModal"), { ssr: false });

export default function BuildingTable() {
  const [Buildings, setBuilding] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuildings();
  }, []);

  // Initialize DataTable after buildings load
  useEffect(() => {
    if (!loading && Buildings.length > 0) {
      // Wait a bit for DOM to update, then call global DataTable function
      setTimeout(() => {
        if (window.initDataTable) {
          window.initDataTable();
        }
      }, 100);
    }
  }, [loading, Buildings]);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/property-records", { credentials: "include" });
      const data = await res.json();
      setBuilding(data.buildings || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch buildings:", err);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const confirm = window.confirm(
      "Are you sure you want to delete this building?"
    );
    if (!confirm) return;

    const res = await fetch(`/api/owner/buildings?id=${id}`, { method: "DELETE", credentials: "include" });
    const result = await res.json();

    if (!res.ok) {
      setLoading(false);
      alert(result.error || "Delete failed");
      return;
    }
    alert("Deleted successfully");
    fetchBuildings();
  };

  return (
    <>
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-bordered table-striped datatables-basic" data-name="Building Records">
            <thead>
              <tr>
                <th style={{width: '15px'}}></th>
                <th>Name</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Units</th>
                <th>Space (sqm)</th>
                <th>Occupancy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Buildings.map((b, i) => (
                <tr key={b.id}>
                  <td></td>
                  <td>{b.name}</td>
                  <td>{b.type}</td>
                  <td>
                    {b.owner_name ? (
                      <span className="text-primary">
                        {b.owner_name}
                      </span>
                    ) : (
                      <span className="text-muted">Unassigned</span>
                    )}
                  </td>
                  <td>{b.units_owned}</td>
                  <td>{b.total_space_sqm}</td>
                  <td>{b.occupancy_status}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link
                        href={`/owner_dashboard/property_records/buildings/${b.id}`}
                        className="btn btn-primary btn-sm"
                        title="View Units"
                      >
                        <i className="bx bx-building-house"></i>
                      </Link>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => setSelected(b)}
                        title="View Details"
                      >
                        <i className="bx bx-show"></i>
                      </button>
                      <Link
                        href={`/owner_dashboard/property_records/buildings/edit/${b.id}`}
                        className="btn btn-warning btn-sm"
                        title="Edit Building"
                      >
                        <i className="bx bx-edit"></i>
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(b.id)}
                        disabled={loading}
                        title="Delete Building"
                      >
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ViewModal data={selected} type="Building" />
    </>
  );
}
