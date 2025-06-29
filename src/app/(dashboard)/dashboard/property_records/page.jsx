import BuildingTable from "./BuildingTable";
import UnitTable from "./UnitTable";

export default function PropertyRecordsPage() {
  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1>Property Records</h1>
          <BuildingTable />
          <UnitTable />
        </div>
      </section>
    </div>
  );
}
