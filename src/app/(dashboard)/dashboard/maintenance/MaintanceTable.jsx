"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function MaintenanceTable() {
  const [records] = useState([
    {
      id: 1,
      unit: "A1",
      description: "Leaking pipe",
      cost: 3000,
      notes: "Urgent fix",
      image: null,
      date: "2025-06-29",
    },
    {
      id: 2,
      unit: "B2",
      description: "Broken window",
      cost: 1500,
      notes: "",
      image: null,
      date: "2025-06-27",
    },
  ]);

  // Initialize DataTable after records load
  useEffect(() => {
    if (records.length > 0) {
      setTimeout(() => {
        if (window.initDataTable) {
          window.initDataTable();
        }
      }, 100);
    }
  }, [records]);

  const handleDelete = async (id) => {
    // Add delete functionality here
    console.log("Delete maintenance record:", id);
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title">Maintenance Records</h3>
        <Link href="/dashboard/maintenance/add" className="btn btn-primary btn-sm">
          <i className="bx bx-plus me-1"></i> Add Record
        </Link>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered table-striped datatables-basic" data-name="Maintenance Records">
            <thead>
              <tr>
                <th style={{width: '15px'}}></th>
                <th>Unit</th>
                <th>Description</th>
                <th>Cost (Ksh)</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item) => (
                <tr key={item.id}>
                  <td></td>
                  <td><strong>{item.unit}</strong></td>
                  <td>{item.description}</td>
                  <td><strong>Ksh {item.cost?.toLocaleString()}</strong></td>
                  <td>{item.date}</td>
                  <td>{item.notes || "—"}</td>
                  <td>
                    {item.image ? (
                      <img src={URL.createObjectURL(item.image)} width="60" alt="Maintenance" className="rounded" />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link
                        href={`/dashboard/maintenance/edit/${item.id}`}
                        className="btn btn-warning btn-sm"
                        title="Edit Record"
                      >
                        <i className="bx bx-edit"></i>
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                        title="Delete Record"
                      >
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No maintenance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
