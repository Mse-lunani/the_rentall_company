// src/app/dashboard/buildings/page.jsx
import BuildingCard from "../components/BuildingCard";
import AddBuildingButton from "../components/AddBuildingButton";

export default function BuildingsPage() {
  // Fetch buildings from API or use mock data
  const buildings = [
    {
      id: "1",
      name: "Sunrise Apartments",
      type: "Residential",
      unitsOwned: 12,
      squareMeters: 4500,
      occupancyStatus: "Fully Occupied",
    },
  ];

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Buildings</h1>
            </div>
            <div className="col-sm-6">
              <AddBuildingButton />
            </div>
          </div>
          <div className="row">
            {buildings.map((building) => (
              <div className="col-lg-4 col-md-6" key={building.id}>
                <BuildingCard building={building} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
