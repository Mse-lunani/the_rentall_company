export default function UnitForm({
  index,
  data,
  onChange,
  onRemove,
  removable,
}) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    onChange({ ...data, [name]: val });
  };

  return (
    <div className="card card-secondary mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title">Unit {index + 1}</h3>
        {removable && (
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="form-group">
          <label>Unit Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={data.name || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Number of Bedrooms</label>
          <input
            type="number"
            name="bedrooms"
            className="form-control"
            value={data.bedrooms || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Space (sqm)</label>
          <input
            type="number"
            name="space_sqm"
            className="form-control"
            value={data.space_sqm || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Floor Number</label>
          <input
            type="number"
            name="floor_number"
            className="form-control"
            value={data.floor_number || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Amenities</label>
          <textarea
            name="amenities"
            className="form-control"
            rows="2"
            placeholder="e.g. WiFi, Balcony, Parking"
            value={data.amenities || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Number of Bathrooms</label>
          <input
            type="number"
            name="bathrooms"
            className="form-control"
            value={data.bathrooms || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-check mb-2">
          <input
            type="checkbox"
            name="has_dsq"
            className="form-check-input"
            id={`dsq-${index}`}
            checked={data.has_dsq || false}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor={`dsq-${index}`}>
            DSQ Available
          </label>
        </div>

        <div className="form-group">
          <label>Rent Amount (KES)</label>
          <input
            type="number"
            name="rent_amount_kes"
            className="form-control"
            value={data.rent_amount_kes || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Deposit Amount (KES)</label>
          <input
            type="number"
            name="deposit_amount_kes"
            className="form-control"
            value={data.deposit_amount_kes || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
