export default function UnitForm({ index, onRemove, removable }) {
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
          <input type="text" className="form-control" required />
        </div>

        <div className="form-group">
          <label>Number of Bedrooms</label>
          <input type="number" className="form-control" required />
        </div>

        <div className="form-group">
          <label>Space (sqm)</label>
          <input type="number" className="form-control" required />
        </div>

        <div className="form-group">
          <label>Floor Number</label>
          <input type="number" className="form-control" required />
        </div>

        <div className="form-group">
          <label>Amenities</label>
          <textarea
            className="form-control"
            rows="2"
            placeholder="e.g. WiFi, Balcony, Parking"
          />
        </div>

        <div className="form-group">
          <label>Number of Bathrooms</label>
          <input type="number" className="form-control" required />
        </div>

        <div className="form-check mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id={`dsq-${index}`}
          />
          <label className="form-check-label" htmlFor={`dsq-${index}`}>
            DSQ Available
          </label>
        </div>

        <div className="form-group">
          <label>Rent Amount (KES)</label>
          <input type="number" className="form-control" required />
        </div>

        <div className="form-group">
          <label>Deposit Amount (KES)</label>
          <input type="number" className="form-control" required />
        </div>
      </div>
    </div>
  );
}
