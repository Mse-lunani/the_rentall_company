"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OwnerTable({ owners, onView, onDelete }) {
  const router = useRouter();

  // Initialize DataTable after owners load
  useEffect(() => {
    if (owners.length > 0) {
      setTimeout(() => {
        if (window.initDataTable) {
          window.initDataTable();
        }
      }, 100);
    }
  }, [owners]);

  const handleView = (owner) => {
    onView(owner);
    const modal = new bootstrap.Modal(
      document.getElementById("viewOwnerModal")
    );
    modal.show();
  };

  const handleDelete = async (id) => {
    onDelete(id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title">Owner List</h3>
        <Link href="/dashboard/owners/add" className="btn btn-primary btn-sm">
          <i className="fas fa-plus"></i> Add Owner
        </Link>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered table-striped datatables-basic" data-name="Owner Records">
            <thead>
              <tr>
                <th style={{width: '15px'}}></th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>National ID</th>
                <th>Password</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
          <tbody>
            {owners.map((owner, index) => (
              <tr key={owner.id}>
                <td></td>
                <td><strong>{owner.full_name}</strong></td>
                <td>{owner.phone}</td>
                <td>{owner.email}</td>
                <td>{owner.national_id || "N/A"}</td>
                <td>
                  <code className="text-success">
                    {owner.password_text || "****"}
                  </code>
                </td>
                <td>{formatDate(owner.created_at)}</td>
                <td>
                  <div className="btn-group" role="group">
                    <Link
                      href={`/dashboard/owners/${owner.id}`}
                      className="btn btn-success btn-sm"
                      title="View Details"
                    >
                      <i className="bx bx-show"></i>
                    </Link>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleView(owner)}
                      title="Quick View"
                    >
                      <i className="bx bx-info-circle"></i>
                    </button>
                    <Link
                      href={`/dashboard/owners/edit/${owner.id}`}
                      className="btn btn-warning btn-sm"
                      title="Edit Owner"
                    >
                      <i className="bx bx-edit"></i>
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(owner.id)}
                      title="Delete Owner"
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
        {owners.length === 0 && (
          <div className="text-center p-4">
            <p className="text-muted">No owners found.</p>
            <Link href="/dashboard/owners/add" className="btn btn-primary">
              Add First Owner
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}