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

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/property-records");
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

    const res = await fetch(`/api/buildings?id=${id}`, { method: "DELETE" });
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
        <div className="card-header">
          <h3 className="card-title">Building Records</h3>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Units</th>
                <th>Space (sqm)</th>
                <th>Occupancy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Buildings.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td>{b.name}</td>
                  <td>{b.type}</td>
                  <td>{b.units_owned}</td>
                  <td>{b.total_space_sqm}</td>
                  <td>{b.occupancy_status}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setSelected(b)}
                    >
                      View
                    </button>{" "}
                    <Link
                      href={`/dashboard/property_records/buildings/edit/${b.id}`}
                      className="btn btn-warning btn-sm"
                    >
                      Edit
                    </Link>{" "}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(b.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
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
