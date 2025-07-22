"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerTable({ owners, onView, onDelete }) {
  const router = useRouter();

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
      <div className="card-body table-responsive p-0">
        <table className="table table-hover text-nowrap">
          <thead>
            <tr>
              <th>#</th>
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
                <td>{index + 1}</td>
                <td>{owner.full_name}</td>
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
                  <Link
                    href={`/dashboard/owners/${owner.id}`}
                    className="btn btn-sm btn-success me-1"
                  >
                    <i className="fas fa-eye"></i> Details
                  </Link>
                  <button
                    className="btn btn-sm btn-info me-1"
                    onClick={() => handleView(owner)}
                  >
                    <i className="fas fa-info-circle"></i> Quick View
                  </button>
                  <Link
                    href={`/dashboard/owners/edit/${owner.id}`}
                    className="btn btn-warning btn-sm me-1"
                  >
                    <i className="fas fa-edit"></i> Edit
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(owner.id)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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