import MaintenanceTable from "./MaintanceTable";

export default function MaintenanceLogsPage() {
  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h4 className="mb-4">Maintenance Logs</h4>
          <MaintenanceTable />
        </div>
      </section>
    </div>
  );
}
