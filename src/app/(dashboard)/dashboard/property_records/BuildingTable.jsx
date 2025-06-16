export default function BuildingTable() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Building Records</h3>
      </div>
      <div className="card-body">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Type</th>
              <th>No. of Units</th>
              <th>Space (sqm)</th>
              <th>Occupancy</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Replace this with mapped data */}
            <tr>
              <td>1</td>
              <td>Sky View Towers</td>
              <td>Apartment</td>
              <td>12</td>
              <td>3500</td>
              <td>Partially Occupied</td>
              <td>
                <button className="btn btn-info btn-sm">View</button>{" "}
                <button className="btn btn-warning btn-sm">Edit</button>{" "}
                <button className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
