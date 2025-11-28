"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function TenantTable({ tenants, onView, onDelete }) {
  useEffect(() => {
    // Initialize DataTable after component mounts
    if (tenants && tenants.length > 0) {
      setTimeout(() => {
        if (window.initDataTable) {
          window.initDataTable();
        }
      }, 100);
    }
  }, [tenants]);

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bx bx-user me-2"></i>All Tenants
        </h5>
        <Link href="/owner_dashboard/tenants/add" className="btn btn-primary">
          <i className="bx bx-plus me-1"></i>Add Tenant
        </Link>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table
            className="table table-hover datatables-basic"
            data-name="All Tenants"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Current Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, index) => (
                <tr key={tenant.id}>
                  <td>{index + 1}</td>
                  <td>{tenant.full_name}</td>
                  <td>{tenant.phone}</td>
                  <td>{tenant.email || "N/A"}</td>
                  <td>
                    {tenant.tenancy_status === "HAS_ACTIVE_TENANCY" ? (
                      <div>
                        <div className="fw-semibold">{tenant.unit_name}</div>
                        <small className="text-muted">
                          {tenant.building_name}
                        </small>
                      </div>
                    ) : tenant.tenancy_status === "LEGACY_ONLY" ? (
                      <div>
                        <div className="fw-semibold">
                          {tenant.legacy_unit_name}
                        </div>
                        <small className="text-muted">
                          {tenant.legacy_building_name}
                        </small>
                        <span className="badge bg-label-warning ms-2">
                          Legacy
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted">Not Assigned</span>
                    )}
                  </td>
                  <td>
                    {tenant.tenancy_status === "HAS_ACTIVE_TENANCY" ? (
                      <span className="badge bg-label-success">Active</span>
                    ) : tenant.tenancy_status === "LEGACY_ONLY" ? (
                      <span className="badge bg-label-warning">Legacy</span>
                    ) : (
                      <span className="badge bg-label-secondary">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link
                        href={`/owner_dashboard/tenants/${tenant.id}`}
                        className="btn btn-sm btn-primary"
                        title="View full profile"
                      >
                        <i className="bx bx-show me-1"></i>View
                      </Link>
                      <button
                        className="btn btn-sm btn-label-info"
                        data-bs-toggle="modal"
                        data-bs-target="#viewTenantModal"
                        onClick={() => onView(tenant)}
                        title="Quick view"
                      >
                        <i className="bx bx-info-circle me-1"></i>Quick View
                      </button>
                      <Link
                        href={`/owner_dashboard/tenants/edit/${tenant.id}`}
                        className="btn btn-sm btn-label-warning"
                        title="Edit tenant"
                      >
                        <i className="bx bx-edit"></i>
                      </Link>
                      <button
                        className="btn btn-sm btn-label-danger"
                        onClick={() => onDelete(tenant.id)}
                        title="Delete tenant"
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
    </div>
  );
}
