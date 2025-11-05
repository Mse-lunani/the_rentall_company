"use client";
import UnitConfigModal from "./UnitConfigModal";
import { useEffect } from "react";
import { useState } from "react";
import BuildingForm from "./BuildingForm";
import UnitForm from "./UnitForm";
import { useRouter } from "next/navigation";
import CSVUnitUpload from "./CSVUnitUpload";

export default function PropertyEntryPage() {
  const [entryType, setEntryType] = useState("building");
  const [building, setBuilding] = useState({});
  const [units, setUnits] = useState([{ id: Date.now(), data: {} }]);
  const [showConfig, setShowConfig] = useState(false);
  const router = useRouter();
  const [currentbuildings, setCurrentBuildings] = useState([]);
  const [owners, setOwners] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("manual"); // "manual" or "csv"

  useEffect(() => {
    // Fetch owner's buildings
    fetch("/api/owner/buildings")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched buildings:", data);
        setCurrentBuildings(data || []);
      });

    // No need to fetch owners for owner portal - they can only create properties for themselves
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
    setIsSubmitting(true);

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
        setIsSubmitting(false);
        return;
      }

      payload = {
        building_id,
        units: unitPayload,
      };
    } else {
      // For unit-only entries
      payload = {
        units: unitPayload,
      };
    }

    try {
      const res = await fetch("/api/owner/property-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        alert("Property entry successful!");
        router.push("/owner_dashboard/property_records");
      } else {
        alert("Failed to save: " + result.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
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
                      onChange={(e) => {
                        setBuilding({
                          building_id: e.target.value,
                        });
                        // Reset upload method when building changes
                        setUploadMethod("manual");
                      }}
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

                  {/* Upload Method Selection - Only show when building is selected */}
                  {building.building_id && (
                    <div className="form-group mt-4">
                      <label className="d-block mb-3">
                        <strong>Upload Method:</strong>
                      </label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="uploadMethod"
                          value="manual"
                          checked={uploadMethod === "manual"}
                          onChange={() => setUploadMethod("manual")}
                        />
                        <label className="form-check-label">
                          Manual Entry (Form)
                        </label>
                      </div>
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="uploadMethod"
                          value="csv"
                          checked={uploadMethod === "csv"}
                          onChange={() => setUploadMethod("csv")}
                        />
                        <label className="form-check-label">
                          Bulk Upload (CSV)
                        </label>
                      </div>
                    </div>
                  )}
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

            {/* Units Info - Show CSV Upload or Manual Form */}
            {entryType === "unit-to-building" &&
            uploadMethod === "csv" &&
            building.building_id ? (
              // CSV Upload for unit-to-building
              <div className="card card-primary mt-3">
                <div className="card-header">
                  <h3 className="card-title">Bulk Upload Units (CSV)</h3>
                </div>
                <div className="card-body p-5">
                  <CSVUnitUpload
                    buildingId={building.building_id}
                    onSuccess={(result) => {
                      alert(
                        `Successfully uploaded ${result.successfulUnits} units!`
                      );
                      router.push("/owner_dashboard/property_records");
                    }}
                  />
                </div>
              </div>
            ) : entryType === "unit-to-building" ||
              entryType === "building" ||
              entryType === "unit" ? (
              // Manual Form for all entry types (except when CSV is selected for unit-to-building)
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
                      onChange={(updatedData) =>
                        updateUnit(unit.id, updatedData)
                      }
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
            ) : null}

            {/* Submit Button - Only show for manual entry */}
            {!(entryType === "unit-to-building" && uploadMethod === "csv") && (
              <div className="card-footer">
                <button
                  type="submit"
                  className="mt-3 btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Property"}
                </button>
              </div>
            )}
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
