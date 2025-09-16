"use client";

import { on } from "events";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TenantTable({ tenants, onView, onDelete }) {
  const router = useRouter();
  console.log("Tenants:", tenants);
  
  const handleView = (tenant) => {
    onView(tenant);
    const modal = new bootstrap.Modal(
      document.getElementById("viewTenantModal")
    );
    modal.show();
  };
  
  const handleDelete = async (id) => {
    onDelete(id);
  };

  const getTenancyStatusBadge = (status) => {
    const statusMap = {
      'active': { class: 'bg-success text-white', text: 'Active Tenancy' },
      'terminated': { class: 'bg-secondary text-white', text: 'Terminated' },
      'NO_UNIT': { class: 'bg-warning text-dark', text: 'No Unit' }
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary text-white', text: 'Unknown' };
    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
    );
  };

  const getUnitInfo = (tenant) => {
    if (tenant.unit_name) {
      return `${tenant.unit_name} (${tenant.building_name || 'N/A'})`;
    }
    return 'No Unit Assigned';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Tenant List</h3>
      </div>
      <div className="card-body table-responsive p-0">
        <table className="table table-hover text-nowrap">
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Current Unit</th>
              <th>Tenancy Status</th>
              <th>Monthly Rent</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, index) => (
              <tr key={tenant.id}>
                <td>{index + 1}</td>
                <td>{tenant.full_name}</td>
                <td>{tenant.phone}</td>
                <td>
                  <div>{getUnitInfo(tenant)}</div>
                  {tenant.start_date && (
                    <small className="text-muted">
                      Since: {new Date(tenant.start_date).toLocaleDateString()}
                    </small>
                  )}
                </td>
                <td>{getTenancyStatusBadge(tenant.occupancy_status)}</td>
                <td>
                  {tenant.monthly_rent ? (
                    <span className="text-success">
                      KES {Number(tenant.monthly_rent).toLocaleString()}
                    </span>
                  ) : tenant.rent_amount_kes ? (
                    <span className="text-muted">
                      KES {Number(tenant.rent_amount_kes).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </td>
                <td>
                  <code className="text-success">{tenant.password_text || "N/A"}</code>
                </td>
                <td>
                  <Link
                    href={`/owner_dashboard/tenants/${tenant.id}`}
                    className="btn btn-primary btn-sm me-1"
                  >
                    Profile
                  </Link>
                  <button
                    className="btn btn-sm btn-info me-1"
                    onClick={() => handleView(tenant)}
                  >
                    Details
                  </button>
                  <Link
                    href={`/owner_dashboard/tenants/edit/${tenant.id}`}
                    className="btn btn-warning btn-sm me-1"
                  >
                    Edit
                  </Link>
                  {tenant.occupancy_status === 'active' && (
                    <Link
                      href={`/owner_dashboard/tenancies/tenant/${tenant.id}`}
                      className="btn btn-success btn-sm me-1"
                    >
                      Tenancy
                    </Link>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(tenant.id)}
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
  );
}
