"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const ViewModal = dynamic(() => import("./ViewModal"), { ssr: false });

export default function UnitTable() {
  const [units, setUnits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnits();
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

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/property-records", { credentials: "include" });
      const data = await res.json();
      setUnits(data.units || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch units:", err);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const confirm = window.confirm(
      "Are you sure you want to delete this building?"
    );
    if (!confirm) return;

    const res = await fetch(`/api/owner/units?id=${id}`, { method: "DELETE", credentials: "include" });
    const result = await res.json();

    if (!res.ok) {
      setLoading(false);
      alert(result.error || "Delete failed");
      return;
    }
    alert("Deleted successfully");
    fetchUnits();
  };

  return (
    <>
      <div className="card mt-4">
        <div className="card-body table-responsive">
          <table
            className="table table-bordered table-striped datatables-basic"
            data-name="Unit Records"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Unit</th>
                <th>Owner</th>
                <th>Bedrooms</th>
                <th>Bathrooms</th>
                <th>Rent</th>
                <th>Building</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{u.name}</td>
                  <td>
                    {u.owner_name ? (
                      <Link
                        href={`/owner_dashboard/profile`}
                        className="text-primary"
                      >
                        {u.owner_name}
                      </Link>
                    ) : (
                      <span className="text-muted">Unassigned</span>
                    )}
                  </td>
                  <td>{u.bedrooms}</td>
                  <td>{u.bathrooms}</td>
                  <td>Ksh {u.rent_amount_kes?.toLocaleString()}</td>
                  <td>{u.building_name}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setSelected(u)}
                    >
                      View
                    </button>{" "}
                    <Link
                    href={`/owner_dashboard/property_records/units/edit/${u.id}`}
                    className="btn btn-warning btn-sm"
                    >
                      Edit
                    </Link>{" "}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(u.id)}
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

      <ViewModal data={selected} type="Unit" />
    </>
  );
}
