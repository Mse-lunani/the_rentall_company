"use client";
import { useState } from "react";
import BuildingForm from "./BuildingForm";
import UnitForm from "./UnitForm";

export default function PropertyEntryPage() {
  const [entryType, setEntryType] = useState("building"); // 'building' | 'unit'
  const [units, setUnits] = useState([{ id: Date.now() }]);

  const addUnit = () => {
    setUnits([...units, { id: Date.now() }]);
  };

  const removeUnit = (id) => {
    setUnits(units.filter((u) => u.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submission will be implemented later
  };

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h3 className="mb-2">Add Property</h3>
          <form onSubmit={handleSubmit}>
            <div className="card card-default">
              <div className="card-header">
                <h3 className="card-title">Entry Type</h3>
              </div>
              <div className="card-body">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="entryType"
                    value="building"
                    checked={entryType === "building"}
                    onChange={() => setEntryType("building")}
                  />
                  <label className="form-check-label">
                    Add Building with Units
                  </label>
                </div>
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="entryType"
                    value="unit"
                    checked={entryType === "unit"}
                    onChange={() => setEntryType("unit")}
                  />
                  <label className="form-check-label">Add Unit Only</label>
                </div>
              </div>
            </div>

            {entryType === "building" && <BuildingForm />}

            <div className="card card-primary mt-3">
              <div className="card-header">
                <h3 className="card-title">Unit(s) Details</h3>
              </div>
              <div className="card-body p-5">
                {units.map((unit, index) => (
                  <UnitForm
                    key={unit.id}
                    index={index}
                    onRemove={() => removeUnit(unit.id)}
                    removable={units.length > 1}
                  />
                ))}
                <button
                  type="button"
                  className="btn btn-secondary mt-3"
                  onClick={addUnit}
                >
                  + Add Another Unit
                </button>
              </div>
            </div>

            <div className="card-footer">
              <button type="submit" className="btn btn-primary">
                Submit Property
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
