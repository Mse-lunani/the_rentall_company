export default function UnitTable() {
  return (
    <div className="card mt-4">
      <div className="card-header">
        <h3 className="card-title">Unit Records</h3>
      </div>
      <div className="card-body">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Unit Name</th>
              <th>Bedrooms</th>
              <th>Bathrooms</th>
              <th>DSQ</th>
              <th>Floor</th>
              <th>Rent (KES)</th>
              <th>Deposit (KES)</th>
              <th>Space (sqm)</th>
              <th>Amenities</th>
              <th>Building</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Replace this with mapped data */}
            <tr>
              <td>1</td>
              <td>Unit A3</td>
              <td>2</td>
              <td>1</td>
              <td>Yes</td>
              <td>3</td>
              <td>25,000</td>
              <td>25,000</td>
              <td>85</td>
              <td>WiFi, Parking</td>
              <td>Sky View Towers</td>
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
