import Link from "next/link";

export default function UnitsTable({ units }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Units</h3>
        <div className="card-tools">
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Search units..."
            />
            <div className="input-group-append">
              <button className="btn btn-primary">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Unit Name</th>
              <th>Building</th>
              <th>Type</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id}>
                <td>{unit.name}</td>
                <td>
                  {unit.buildingId ? (
                    <Link href={`/dashboard/buildings/${unit.buildingId}`}>
                      {getBuildingById(unit.buildingId)?.name}
                    </Link>
                  ) : (
                    "Standalone"
                  )}
                </td>
                <td>{unit.type}</td>
                <td>${unit.rentAmount}</td>
                <td>
                  <span
                    className={`badge bg-${
                      unit.isOccupied ? "success" : "warning"
                    }`}
                  >
                    {unit.isOccupied ? "Occupied" : "Vacant"}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/dashboard/units/${unit.id}`}
                    className="btn btn-sm btn-info mr-1"
                  >
                    <i className="fas fa-eye"></i>
                  </Link>
                  <Link
                    href={`/dashboard/units/${unit.id}/edit`}
                    className="btn btn-sm btn-primary mr-1"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                  <button className="btn btn-sm btn-danger">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer clearfix">
        <div className="float-left">
          <div className="form-group mb-0">
            <select className="form-control form-control-sm">
              <option>Filter by Building</option>
              {getBuildings().map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="float-right">
          <ul className="pagination pagination-sm m-0">
            <li className="page-item">
              <a className="page-link" href="#">
                «
              </a>
            </li>
            <li className="page-item active">
              <a className="page-link" href="#">
                1
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                2
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                3
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                »
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
