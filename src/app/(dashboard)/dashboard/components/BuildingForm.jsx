"use client";

import { useState } from "react";

export default function BuildingForm() {
  const [formData, setFormData] = useState({
    name: "",
    type: "Residential",
    unitsOwned: 0,
    squareMeters: 0,
    occupancyStatus: "Fully Occupied",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    console.log("Building submitted:", formData);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add New Building</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Building Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Building Type</label>
              <select
                className="form-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                {["Residential", "Commercial", "Mixed", "Industrial"].map(
                  (type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Units You Own</label>
              <input
                type="number"
                className="form-control"
                name="unitsOwned"
                min="0"
                value={formData.unitsOwned}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Space (m²)</label>
              <input
                type="number"
                className="form-control"
                name="squareMeters"
                min="0"
                step="0.1"
                value={formData.squareMeters}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Occupancy Status</label>
              <select
                className="form-select"
                name="occupancyStatus"
                value={formData.occupancyStatus}
                onChange={handleChange}
              >
                {["Fully Occupied", "Partially Occupied", "Vacant"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Save Building
          </button>
        </form>
      </div>
    </div>
  );
}
