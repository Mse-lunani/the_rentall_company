"use client";
import UnitConfigModal from "./UnitConfigModal";
import { useEffect } from "react";
import { useState } from "react";
import BuildingForm from "./BuildingForm";
import UnitForm from "./UnitForm";
import { useRouter } from "next/navigation";

export default function PropertyEntryPage() {
  const [entryType, setEntryType] = useState("building");
  const [building, setBuilding] = useState({});
  const [units, setUnits] = useState([{ id: Date.now(), data: {} }]);
  const [showConfig, setShowConfig] = useState(false);
  const router = useRouter();
  const [currentbuildings, setCurrentBuildings] = useState([]);

  useEffect(() => {
    fetch("/api/property-records")
      .then((res) => res.json())
      .then((data) => {
        setCurrentBuildings(data.buildings || []);
      });
  }, []);

  const addUnit = () => {
    setUnits([...units, { id: Date.now(), data: {} }]);
  };

  const removeUnit = (id) => {
    setUnits(units.filter((u) => u.id !== id));
  };

  const updateUnit = (id, updatedData) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, data: updatedData } : u))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const unitPayload = units.map((u) => u.data);

    let payload;

    if (entryType === "building") {
      payload = {
        building,
        units: unitPayload,
      };
    } else if (entryType === "unit-to-building") {
      const building_id = parseInt(building.building_id);
      if (!building_id) {
        alert("Please select a building.");
        return;
      }

      payload = {
        building_id,
        units: unitPayload,
      };
    } else {
      payload = {
        units: unitPayload,
      };
    }

    const res = await fetch("/api/property-entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.success) {
      alert("Property entry successful!");
      router.push("/dashboard/property_records");
    } else {
      alert("Failed to save: " + result.message);
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h3 className="mb-2">Add Property</h3>
          <form onSubmit={handleSubmit}>
            {/* Entry Type */}
            <div className="card card-default">
              <div className="card-header">
                <h3 className="card-title">Entry Type</h3>
              </div>
              <div className="card-body">
                <div className="form-check mt-2">
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
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="entryType"
                    value="unit-to-building"
                    checked={entryType === "unit-to-building"}
                    onChange={() => setEntryType("unit-to-building")}
                  />
                  <label className="form-check-label">
                    Add Units to Existing Building
                  </label>
                </div>
              </div>
            </div>

            {/* Building Info */}
            {entryType === "building" && (
              <BuildingForm form={building} setForm={setBuilding} />
            )}

            {entryType === "unit-to-building" && (
              <div className="card card-info mt-3">
                <div className="card-header">
                  <h3 className="card-title">Select Building</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Building</label>
                    <select
                      name="building_id"
                      className="form-control"
                      value={building.building_id || ""}
                      onChange={(e) =>
                        setBuilding({
                          building_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Building</option>
                      {currentbuildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {entryType === "building" && parseInt(building.units_owned) > 1 && (
              <div className="mt-3 mb-3">
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() => setShowConfig(true)}
                >
                  ⚙ Configure Units
                </button>
              </div>
            )}

            {/* Units Info */}
            <div className="card card-primary mt-3">
              <div className="card-header">
                <h3 className="card-title">Unit(s) Details</h3>
              </div>
              <div className="card-body p-5">
                {units.map((unit, index) => (
                  <UnitForm
                    key={unit.id}
                    index={index}
                    data={unit.data}
                    onChange={(updatedData) => updateUnit(unit.id, updatedData)}
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
              <button type="submit" className="mt-3 btn btn-primary">
                Submit Property
              </button>
            </div>
          </form>
        </div>
      </section>
      <UnitConfigModal
        show={showConfig}
        onClose={() => setShowConfig(false)}
        total={parseInt(building.units_owned || 1)}
        onGenerate={(generated) =>
          setUnits(
            generated.map((data) => ({ id: Date.now() + Math.random(), data }))
          )
        }
      />
    </div>
  );
}
