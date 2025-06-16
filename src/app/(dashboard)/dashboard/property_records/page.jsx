import BuildingTable from "./BuildingTable";
import UnitTable from "./UnitTable";

export default function PropertyRecordsPage() {
  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h3 className="mb-2">Property Records</h3>
          <BuildingTable />
          <UnitTable />
        </div>
      </section>
    </div>
  );
}
