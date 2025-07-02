export default function BuildingForm({ form, setForm }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="card card-info mt-3">
      <div className="card-header">
        <h3 className="card-title">Building Details</h3>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label>Building Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={form.name || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Building Type</label>
          <select
            name="type"
            className="form-control"
            value={form.type || ""}
            onChange={handleChange}
            required
          >
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
          <input
            type="number"
            name="units_owned"
            className="form-control"
            value={form.units_owned || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Total Space (in sqm)</label>
          <input
            type="number"
            name="total_space_sqm"
            className="form-control"
            value={form.total_space_sqm || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Occupancy Status</label>
          <select
            name="occupancy_status"
            className="form-control"
            value={form.occupancy_status || ""}
            onChange={handleChange}
            required
          >
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
