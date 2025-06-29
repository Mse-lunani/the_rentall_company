"use client";

export default function TenantTable({ tenants, onView }) {
  const handleView = (tenant) => {
    onView(tenant);
    const modal = new bootstrap.Modal(
      document.getElementById("viewTenantModal")
    );
    modal.show();
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
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, index) => (
              <tr key={tenant.id}>
                <td>{index + 1}</td>
                <td>{tenant.fullName}</td>
                <td>{tenant.phone}</td>
                <td>{tenant.unit}</td>
                <td>
                  <span
                    className={`badge ${
                      tenant.status === "Active" ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {tenant.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-1"
                    onClick={() => handleView(tenant)}
                  >
                    View
                  </button>
                  <button className="btn btn-sm btn-warning me-1" disabled>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" disabled>
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
