// src/app/dashboard/units/page.jsx
import UnitCard from "../components/UnitCard";
import AddUnitButton from "../components/AddUnitButton";

export default function UnitsPage() {
  // Fetch units from API or use mock data
  const units = [
    {
      id: "1",
      name: "Unit 101",
      type: "2BR",
      squareMeters: 85,
      floorNumber: 1,
      amenities: ["Parking", "Balcony"],
      bathrooms: 2,
      hasDSQ: true,
      rentAmount: 1500,
      depositAmount: 3000,
      building: "Sunrise Apartments",
    },
    // ... more units
  ];

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Units</h1>
            </div>
            <div className="col-sm-6">
              <AddUnitButton />
            </div>
          </div>
          <div className="row">
            {units.map((unit) => (
              <div className="col-lg-4 col-md-6" key={unit.id}>
                <UnitCard unit={unit} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
