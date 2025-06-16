import { useState, useEffect } from "react";
import { getBuildings } from "@/app/lib/dummyData";

export default function UnitForm({
  initialData = null,
  buildingId = null,
  onSubmit,
}) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      buildingId: buildingId || "",
      type: "1BR",
      squareMeters: "",
      floorNumber: "",
      amenities: [],
      bathrooms: 1,
      hasDSQ: false,
      rentAmount: "",
      depositAmount: "",
      isOccupied: false,
    }
  );

  const buildings = getBuildings();
  const amenityOptions = [
    "Parking",
    "Balcony",
    "Gym",
    "Pool",
    "Laundry",
    "Storage",
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const amenities = [...prev.amenities];
      if (amenities.includes(amenity)) {
        return { ...prev, amenities: amenities.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...amenities, amenity] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Unit Name</label>
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
        <div className="col-md-6">
          <div className="form-group">
            <label>Building</label>
            <select
              className="form-control"
              name="buildingId"
              value={formData.buildingId}
              onChange={handleChange}
            >
              <option value="">Standalone Unit</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>Unit Type</label>
            <select
              className="form-control"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Studio">Studio</option>
              <option value="1BR">1 Bedroom</option>
              <option value="2BR">2 Bedrooms</option>
              <option value="3BR">3+ Bedrooms</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="form-group">
            <label>Size (m²)</label>
            <input
              type="number"
              className="form-control"
              name="squareMeters"
              value={formData.squareMeters}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group">
            <label>Floor Number</label>
            <input
              type="number"
              className="form-control"
              name="floorNumber"
              value={formData.floorNumber}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group">
            <label>Bathrooms</label>
            <input
              type="number"
              className="form-control"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Amenities</label>
        <div className="row">
          {amenityOptions.map((amenity) => (
            <div key={amenity} className="col-md-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`amenity-${amenity}`}
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                />
                <label
                  className="form-check-label"
                  htmlFor={`amenity-${amenity}`}
                >
                  {amenity}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label>Monthly Rent ($)</label>
            <input
              type="number"
              className="form-control"
              name="rentAmount"
              value={formData.rentAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>Deposit Amount ($)</label>
            <input
              type="number"
              className="form-control"
              name="depositAmount"
              value={formData.depositAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="isOccupied"
          name="isOccupied"
          checked={formData.isOccupied}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="isOccupied">
          Currently Occupied
        </label>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="hasDSQ"
          name="hasDSQ"
          checked={formData.hasDSQ}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="hasDSQ">
          Has DSQ (Domestic Staff Quarters)
        </label>
      </div>

      <button type="submit" className="btn btn-primary">
        {initialData ? "Update Unit" : "Create Unit"}
      </button>
    </form>
  );
}
