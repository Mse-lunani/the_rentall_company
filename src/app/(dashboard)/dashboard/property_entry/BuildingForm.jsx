export default function BuildingForm() {
  return (
    <div className="card card-info mt-3">
      <div className="card-header">
        <h3 className="card-title">Building Details</h3>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label>Building Name</label>
          <input type="text" className="form-control" required />
        </div>

        <div className="form-group">
          <label>Building Type</label>
          <select className="form-control" required>
            <option value="">Select</option>
            <option>Apartment</option>
            <option>Bedsitter</option>
            <option>Maisonette</option>
            <option>Flat</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>No. of Units You Own</label>
          <input type="number" className="form-control" required />
        </div>

        <div className="form-group">
          <label>Total Space (in sqm)</label>
          <input type="number" className="form-control" required />
        </div>

        <div className="form-group">
          <label>Occupancy Status</label>
          <select className="form-control" required>
            <option value="">Select</option>
            <option>Fully Occupied</option>
            <option>Partially Occupied</option>
            <option>Not Occupied</option>
          </select>
        </div>
      </div>
    </div>
  );
}
